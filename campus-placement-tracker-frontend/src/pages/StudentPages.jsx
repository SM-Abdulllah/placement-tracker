import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  Send,
  Trash2
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EmptyState, ErrorList, LoadingState } from "../components/Feedback.jsx";
import { Field } from "../components/Form.jsx";
import { PageHeader, StatCard } from "../components/Layout.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  deadlineIsOpen,
  formatDate,
  formatDateTime,
  getApplicationForJob
} from "../utils/format.js";

export function StudentDashboard() {
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    Promise.all([api.studentProfile(), api.availableJobs(), api.myApplications()])
      .then(([profile, jobs, applications]) => {
        if (mounted) setState({ loading: false, profile, jobs, applications });
      })
      .catch((error) => mounted && setState({ loading: false, error }));
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) return <LoadingState label="Loading student dashboard" />;
  if (state.error) return <ErrorList error={state.error} />;

  const scheduled = state.applications.filter(
    (app) => app.status === "INTERVIEW_SCHEDULED"
  ).length;

  return (
    <section>
      <PageHeader
        eyebrow="Student Dashboard"
        title={`Welcome, ${state.profile.fullName}`}
        actions={
          <Link className="button primary" to="/student/jobs">
            <Send size={17} />
            Apply to Jobs
          </Link>
        }
      >
        Track eligible jobs, submitted applications, and interview bookings.
      </PageHeader>

      <div className="stats-grid">
        <StatCard label="Eligible Jobs" value={state.jobs.length} tone="teal" />
        <StatCard label="Applications" value={state.applications.length} tone="amber" />
        <StatCard label="Scheduled Interviews" value={scheduled} tone="green" />
      </div>

      <div className="content-grid two">
        <section className="panel">
          <h2>Recent Applications</h2>
          <ApplicationList applications={state.applications.slice(0, 4)} compact />
        </section>
        <section className="panel">
          <h2>Eligible Jobs</h2>
          <JobList jobs={state.jobs.slice(0, 4)} />
        </section>
      </div>
    </section>
  );
}

export function StudentProfilePage() {
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    api
      .studentProfile()
      .then((profile) => mounted && setState({ loading: false, profile }))
      .catch((error) => mounted && setState({ loading: false, error }));
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) return <LoadingState label="Loading profile" />;
  if (state.error) return <ErrorList error={state.error} />;

  const profile = state.profile.studentProfile;

  return (
    <section>
      <PageHeader eyebrow="Student Profile" title={state.profile.fullName}>
        Academic fields are used by the backend during application eligibility
        checks.
      </PageHeader>

      <div className="panel form-grid two-column">
        <Field label="Email" value={state.profile.email} readOnly />
        <Field label="Roll Number" value={profile.rollNumber} readOnly />
        <Field label="Program/Major" value={profile.program} readOnly />
        <Field label="CGPA" value={profile.cgpa} readOnly />
        <Field label="Backlog Count" value={profile.backlogCount} readOnly />
        <Field label="Semester" value={profile.semester || "Not set"} readOnly />
      </div>
    </section>
  );
}

export function AvailableJobsPage() {
  const { showToast } = useToast();
  const [state, setState] = useState({ loading: true, error: null, jobs: [] });
  const [busyJobId, setBusyJobId] = useState(null);

  const loadJobs = () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    api
      .availableJobs()
      .then((jobs) => setState({ loading: false, error: null, jobs }))
      .catch((error) => setState({ loading: false, error, jobs: [] }));
  };

  useEffect(loadJobs, []);

  const apply = async (jobId) => {
    if (!window.confirm("Submit this application using your saved academic profile?")) {
      return;
    }

    setBusyJobId(jobId);
    try {
      await api.applyToJob(jobId);
      showToast("Application submitted.");
      loadJobs();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBusyJobId(null);
    }
  };

  return (
    <section>
      <PageHeader eyebrow="Student Jobs" title="Available Jobs">
        Only jobs currently eligible for your stored academic profile are listed.
      </PageHeader>
      {state.error ? <ErrorList error={state.error} /> : null}
      {state.loading ? (
        <LoadingState label="Loading jobs" />
      ) : (
        <JobList jobs={state.jobs} onApply={apply} busyJobId={busyJobId} />
      )}
    </section>
  );
}

export function StudentJobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [state, setState] = useState({ loading: true, error: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.publicJob(id), api.studentProfile(), api.myApplications()])
      .then(([job, profile, applications]) => {
        if (mounted) setState({ loading: false, job, profile, applications });
      })
      .catch((error) => mounted && setState({ loading: false, error }));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (state.loading) return <LoadingState label="Loading job details" />;
  if (state.error) return <ErrorList error={state.error} />;

  const existingApplication = getApplicationForJob(state.applications, id);
  const profile = state.profile.studentProfile;

  const apply = async () => {
    if (!window.confirm("Apply with your saved academic profile?")) return;
    setSubmitting(true);
    try {
      await api.applyToJob(Number(id));
      showToast("Application submitted.");
      navigate("/student/applications");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow={state.job.recruiter.companyName}
        title={state.job.title}
        actions={
          <Link className="button ghost" to="/student/jobs">
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      >
        {state.job.location || "Location not specified"} - {state.job.jobType || "Role"}
      </PageHeader>

      <div className="content-grid two">
        <article className="panel detail-panel">
          <h2>Job Details</h2>
          <p>{state.job.description}</p>
          <dl className="details-grid">
            <Detail label="Package" value={state.job.salaryPackage || "Not disclosed"} />
            <Detail label="Deadline" value={formatDateTime(state.job.applicationDeadline)} />
            <Detail label="Minimum CGPA" value={state.job.minCgpa} />
            <Detail label="Max Backlogs" value={state.job.maxBacklogs} />
            <Detail label="Programs" value={state.job.allowedPrograms.join(", ")} />
            <Detail label="Status" value={state.job.isPublished ? "Published" : "Draft"} />
          </dl>
        </article>

        <aside className="panel">
          <h2>Application Profile</h2>
          <div className="readonly-stack">
            <Field label="Roll Number" value={profile.rollNumber} readOnly />
            <Field label="CGPA" value={profile.cgpa} readOnly />
            <Field label="Program/Major" value={profile.program} readOnly />
            <Field label="Backlogs" value={profile.backlogCount} readOnly />
            <Field label="Semester" value={profile.semester || "Not set"} readOnly />
          </div>

          {existingApplication ? (
            <div className="alert subtle-alert">
              Current status: <StatusBadge status={existingApplication.status} />
            </div>
          ) : (
            <button
              className="button primary full"
              type="button"
              onClick={apply}
              disabled={submitting || !deadlineIsOpen(state.job.applicationDeadline)}
            >
              <Send size={18} />
              {submitting ? "Applying" : "Apply"}
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

export function MyApplicationsPage() {
  const { showToast } = useToast();
  const [state, setState] = useState({ loading: true, error: null, applications: [] });

  const loadApplications = () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    api
      .myApplications()
      .then((applications) =>
        setState({ loading: false, error: null, applications })
      )
      .catch((error) =>
        setState({ loading: false, error, applications: [] })
      );
  };

  useEffect(loadApplications, []);

  const withdraw = async (application) => {
    if (!window.confirm(`Withdraw application for ${application.job.title}?`)) {
      return;
    }

    try {
      await api.deleteApplication(application.id);
      showToast("Application withdrawn.");
      loadApplications();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <section>
      <PageHeader eyebrow="Student Applications" title="My Applications" />
      {state.error ? <ErrorList error={state.error} /> : null}
      {state.loading ? (
        <LoadingState label="Loading applications" />
      ) : (
        <ApplicationList applications={state.applications} onWithdraw={withdraw} />
      )}
    </section>
  );
}

export function StudentSlotBookingPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [state, setState] = useState({ loading: true, error: null });
  const [bookingSlotId, setBookingSlotId] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .myApplications()
      .then(async (applications) => {
        const application = applications.find(
          (item) => item.id === Number(applicationId)
        );

        if (!application) {
          throw new Error("Application not found.");
        }

        const slots = await api.slotsForJob(application.jobId, true);
        if (mounted) {
          setState({ loading: false, application, slots, error: null });
        }
      })
      .catch((error) => mounted && setState({ loading: false, error }));

    return () => {
      mounted = false;
    };
  }, [applicationId]);

  if (state.loading) return <LoadingState label="Loading interview slots" />;
  if (state.error) return <ErrorList error={state.error} />;

  const book = async (slot) => {
    if (!window.confirm(`Book ${formatDateTime(slot.startTime)}?`)) return;

    setBookingSlotId(slot.id);
    try {
      await api.bookSlot(slot.id, state.application.id);
      showToast("Interview slot booked.");
      navigate("/student/applications");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBookingSlotId(null);
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Interview Booking"
        title={state.application.job.title}
        actions={
          <Link className="button ghost" to="/student/applications">
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      >
        Slots are shown only after recruiter shortlist approval.
      </PageHeader>

      <div className="card-grid">
        {state.slots.map((slot) => (
          <article className="card" key={slot.id}>
            <div className="card-topline">
              <CalendarClock size={18} />
              <StatusBadge status={slot.status} />
            </div>
            <h3>{formatDate(slot.date)}</h3>
            <p>{formatDateTime(slot.startTime)} to {formatDateTime(slot.endTime)}</p>
            <button
              className="button primary full"
              type="button"
              onClick={() => book(slot)}
              disabled={bookingSlotId === slot.id}
            >
              <CheckCircle2 size={18} />
              {bookingSlotId === slot.id ? "Booking" : "Book Slot"}
            </button>
          </article>
        ))}
      </div>

      {!state.slots.length ? (
        <EmptyState title="No slots available" text="Check again after the recruiter adds more slots." />
      ) : null}
    </section>
  );
}

function JobList({ jobs, onApply, busyJobId }) {
  if (!jobs.length) {
    return (
      <EmptyState
        title="No eligible jobs"
        text="Published jobs that match your CGPA, program, backlogs, and deadline will appear here."
      />
    );
  }

  return (
    <div className="card-grid">
      {jobs.map((job) => (
        <article className="card" key={job.id}>
          <div className="card-topline">
            <span>{job.recruiter.companyName}</span>
            <span>{job.jobType || "Role"}</span>
          </div>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <dl className="mini-details">
            <Detail label="CGPA" value={job.minCgpa} />
            <Detail label="Backlogs" value={job.maxBacklogs} />
            <Detail label="Deadline" value={formatDate(job.applicationDeadline)} />
          </dl>
          <div className="button-row">
            <Link className="button ghost" to={`/student/jobs/${job.id}`}>
              <Eye size={17} />
              Details
            </Link>
            {onApply ? (
              <button
                className="button primary"
                type="button"
                onClick={() => onApply(job.id)}
                disabled={busyJobId === job.id}
              >
                <Send size={17} />
                {busyJobId === job.id ? "Applying" : "Apply"}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function ApplicationList({ applications, onWithdraw, compact = false }) {
  if (!applications.length) {
    return (
      <EmptyState
        title="No applications"
        text="Your submitted applications and interview progress will appear here."
      />
    );
  }

  return (
    <div className={compact ? "list-stack compact-list" : "list-stack"}>
      {applications.map((application) => (
        <article className="list-item" key={application.id}>
          <div>
            <span className="eyebrow">{application.job.recruiter.companyName}</span>
            <h3>{application.job.title}</h3>
            <p>Applied {formatDateTime(application.appliedAt)}</p>
            {application.booking ? (
              <p>Interview: {formatDateTime(application.booking.slot.startTime)}</p>
            ) : null}
          </div>
          <div className="list-actions">
            <StatusBadge status={application.status} />
            {application.status === "SHORTLISTED" ? (
              <Link className="button secondary" to={`/student/applications/${application.id}/slots`}>
                <CalendarClock size={17} />
                Book Slot
              </Link>
            ) : null}
            {onWithdraw &&
            ["APPLIED", "REJECTED"].includes(application.status) ? (
              <button className="icon-button danger" type="button" onClick={() => onWithdraw(application)} aria-label="Withdraw application" title="Withdraw application">
                <Trash2 size={17} />
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
