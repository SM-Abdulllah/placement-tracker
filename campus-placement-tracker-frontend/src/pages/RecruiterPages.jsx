import {
  ArrowLeft,
  CalendarClock,
  Check,
  ClipboardList,
  Edit3,
  Eye,
  Plus,
  Save,
  Trash2,
  UsersRound
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { EmptyState, ErrorList, LoadingState } from "../components/Feedback.jsx";
import {
  Field,
  ProgramPicker,
  SelectField,
  TextAreaField
} from "../components/Form.jsx";
import { PageHeader, StatCard } from "../components/Layout.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { useConfirm } from "../context/ConfirmContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  applicationStatuses,
  formatDate,
  formatDateTime,
  fromDatetimeLocalValue,
  jobTypes,
  toDatetimeLocalValue
} from "../utils/format.js";

const emptyJobForm = {
  title: "",
  description: "",
  location: "",
  jobType: "",
  salaryPackage: "",
  minCgpa: "3.0",
  maxBacklogs: "0",
  allowedPrograms: ["BSCS"],
  applicationDeadline: "",
  isPublished: true
};

const emptySlotForm = {
  date: "",
  startTime: "",
  endTime: ""
};

export function RecruiterDashboard() {
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.recruiterProfile(),
      api.recruiterJobs(),
      api.recruiterApplications()
    ])
      .then(([profile, jobs, applications]) => {
        if (mounted) setState({ loading: false, profile, jobs, applications });
      })
      .catch((error) => mounted && setState({ loading: false, error }));
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) return <LoadingState label="Loading recruiter dashboard" />;
  if (state.error) return <ErrorList error={state.error} />;

  const activeJobs = state.jobs.filter((job) => job.isPublished).length;
  const shortlisted = state.applications.filter(
    (application) => application.status === "SHORTLISTED"
  ).length;

  return (
    <section>
      <PageHeader
        eyebrow={state.profile.recruiterProfile.companyName}
        title={`Welcome, ${state.profile.fullName}`}
        actions={
          <Link className="button primary" to="/recruiter/jobs/new">
            <Plus size={17} />
            Create Job
          </Link>
        }
      >
        Manage postings, applications, and interview slots from one workspace.
      </PageHeader>

      <div className="stats-grid">
        <StatCard label="Total Jobs" value={state.jobs.length} tone="teal" />
        <StatCard label="Published Jobs" value={activeJobs} tone="green" />
        <StatCard label="Applications" value={state.applications.length} tone="amber" />
        <StatCard label="Shortlisted" value={shortlisted} tone="neutral" />
      </div>

      <div className="content-grid two">
        <section className="panel">
          <h2>Recent Jobs</h2>
          <RecruiterJobList jobs={state.jobs.slice(0, 4)} />
        </section>
        <section className="panel">
          <h2>Recent Applications</h2>
          <RecruiterApplicationList applications={state.applications.slice(0, 4)} />
        </section>
      </div>
    </section>
  );
}

export function RecruiterJobsPage() {
  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const [state, setState] = useState({ loading: true, error: null, jobs: [] });

  const loadJobs = () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    api
      .recruiterJobs()
      .then((jobs) => setState({ loading: false, error: null, jobs }))
      .catch((error) => setState({ loading: false, error, jobs: [] }));
  };

  useEffect(loadJobs, []);

  const deleteJob = async (job) => {
    const confirmed = await confirmAction({
      title: "Delete job?",
      message: `Delete ${job.title}?`,
      detail: "Related applications, interview slots, and bookings will also be removed.",
      confirmText: "Delete Job",
      tone: "danger"
    });

    if (!confirmed) return;

    try {
      await api.deleteJob(job.id);
      showToast("Job deleted.");
      loadJobs();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Recruiter Jobs"
        title="My Jobs"
        actions={
          <Link className="button primary" to="/recruiter/jobs/new">
            <Plus size={17} />
            Create Job
          </Link>
        }
      />
      {state.error ? <ErrorList error={state.error} /> : null}
      {state.loading ? (
        <LoadingState label="Loading jobs" />
      ) : (
        <RecruiterJobList jobs={state.jobs} onDelete={deleteJob} />
      )}
    </section>
  );
}

export function JobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyJobForm);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    let mounted = true;
    api
      .recruiterJob(id)
      .then((job) => {
        if (!mounted) return;
        setForm({
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          jobType: job.jobType || "",
          salaryPackage: job.salaryPackage || "",
          minCgpa: String(job.minCgpa),
          maxBacklogs: String(job.maxBacklogs),
          allowedPrograms: job.allowedPrograms || [],
          applicationDeadline: toDatetimeLocalValue(job.applicationDeadline),
          isPublished: job.isPublished
        });
        setLoading(false);
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.allowedPrograms.length) {
      setError({ message: "Select at least one allowed program." });
      return;
    }

    if (Number(form.minCgpa) < 0 || Number(form.minCgpa) > 4) {
      setError({ message: "Minimum CGPA must be between 0 and 4.0." });
      return;
    }

    const payload = {
      ...form,
      minCgpa: Number(form.minCgpa),
      maxBacklogs: Number(form.maxBacklogs),
      applicationDeadline: fromDatetimeLocalValue(form.applicationDeadline)
    };

    setSubmitting(true);
    try {
      const job = isEditing
        ? await api.updateJob(id, payload)
        : await api.createJob(payload);
      showToast(isEditing ? "Job updated." : "Job created.");
      navigate(`/recruiter/jobs/${job.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading job form" />;

  return (
    <section>
      <PageHeader
        eyebrow="Job Management"
        title={isEditing ? "Edit Job" : "Create Job"}
        actions={
          <Link className="button ghost" to="/recruiter/jobs">
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      />

      <form className="panel form-grid two-column" onSubmit={onSubmit}>
        <ErrorList error={error} />
        <Field label="Title" name="title" value={form.title} onChange={onChange} required />
        <SelectField label="Job Type" name="jobType" value={form.jobType} onChange={onChange} options={jobTypes} required />
        <Field label="Location" name="location" value={form.location} onChange={onChange} />
        <Field label="Salary/Package" name="salaryPackage" value={form.salaryPackage} onChange={onChange} />
        <Field label="Minimum CGPA" name="minCgpa" type="number" min="0" max="4" step="0.01" value={form.minCgpa} onChange={onChange} required />
        <Field label="Max Backlogs" name="maxBacklogs" type="number" min="0" value={form.maxBacklogs} onChange={onChange} required />
        <Field label="Application Deadline" name="applicationDeadline" type="datetime-local" value={form.applicationDeadline} onChange={onChange} required />
        <label className="toggle-row">
          <input name="isPublished" type="checkbox" checked={form.isPublished} onChange={onChange} />
          <span>Published</span>
        </label>
        <ProgramPicker selected={form.allowedPrograms} onChange={(allowedPrograms) => setForm((current) => ({ ...current, allowedPrograms }))} />
        <TextAreaField label="Description" name="description" value={form.description} onChange={onChange} required />
        <button className="button primary full grid-span" type="submit" disabled={submitting}>
          <Save size={18} />
          {submitting ? "Saving" : "Save Job"}
        </button>
      </form>
    </section>
  );
}

export function RecruiterJobDetailsPage() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    Promise.all([api.recruiterJob(id), api.applicationsForJob(id), api.slotsForJob(id)])
      .then(([job, applications, slots]) => {
        if (mounted) setState({ loading: false, job, applications, slots });
      })
      .catch((error) => mounted && setState({ loading: false, error }));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (state.loading) return <LoadingState label="Loading job details" />;
  if (state.error) return <ErrorList error={state.error} />;

  return (
    <section>
      <PageHeader
        eyebrow={state.job.recruiter.companyName}
        title={state.job.title}
        actions={
          <>
            <Link className="button ghost" to={`/recruiter/jobs/${id}/edit`}>
              <Edit3 size={17} />
              Edit
            </Link>
            <Link className="button secondary" to={`/recruiter/jobs/${id}/applications`}>
              <UsersRound size={17} />
              Applications
            </Link>
            <Link className="button primary" to={`/recruiter/jobs/${id}/slots`}>
              <CalendarClock size={17} />
              Slots
            </Link>
          </>
        }
      >
        {state.job.location || "Location not specified"} - {state.job.jobType || "Role"}
      </PageHeader>

      <div className="stats-grid">
        <StatCard label="Applications" value={state.applications.length} tone="amber" />
        <StatCard label="Slots" value={state.slots.length} tone="teal" />
        <StatCard label="Published" value={state.job.isPublished ? "Yes" : "No"} tone="green" />
      </div>

      <article className="panel detail-panel">
        <h2>Job Details</h2>
        <p>{state.job.description}</p>
        <dl className="details-grid">
          <Detail label="Package" value={state.job.salaryPackage || "Not disclosed"} />
          <Detail label="Deadline" value={formatDateTime(state.job.applicationDeadline)} />
          <Detail label="Minimum CGPA" value={state.job.minCgpa} />
          <Detail label="Max Backlogs" value={state.job.maxBacklogs} />
          <Detail label="Allowed Programs" value={state.job.allowedPrograms.join(", ")} />
        </dl>
      </article>
    </section>
  );
}

export function ApplicationsForJobPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const [state, setState] = useState({ loading: true, error: null });

  const load = () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    Promise.all([api.recruiterJob(id), api.applicationsForJob(id)])
      .then(([job, applications]) => setState({ loading: false, job, applications }))
      .catch((error) => setState({ loading: false, error }));
  };

  useEffect(load, [id]);

  const quickUpdate = async (application, status) => {
    const confirmed = await confirmAction({
      title: `${status === "REJECTED" ? "Reject" : "Shortlist"} applicant?`,
      message: `${application.student.user.fullName} will be moved to ${status}.`,
      detail: `Job: ${application.job.title}`,
      confirmText: status === "REJECTED" ? "Reject" : "Shortlist",
      tone: status === "REJECTED" ? "danger" : "success"
    });

    if (!confirmed) return;

    try {
      await api.updateApplicationStatus(application.id, status);
      showToast(`Application moved to ${status}.`);
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  if (state.loading) return <LoadingState label="Loading applications" />;
  if (state.error) return <ErrorList error={state.error} />;

  return (
    <section>
      <PageHeader
        eyebrow="Applications"
        title={state.job.title}
        actions={
          <Link className="button ghost" to={`/recruiter/jobs/${id}`}>
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      />
      <RecruiterApplicationList applications={state.applications} onQuickUpdate={quickUpdate} />
    </section>
  );
}

export function ApplicationStatusPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const [state, setState] = useState({ loading: true, error: null });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .recruiterApplications()
      .then((applications) => {
        const application = applications.find(
          (item) => item.id === Number(applicationId)
        );
        if (!application) throw new Error("Application not found.");
        if (mounted) {
          setStatus(application.status);
          setState({ loading: false, application, error: null });
        }
      })
      .catch((error) => mounted && setState({ loading: false, error }));
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  const onSubmit = async (event) => {
    event.preventDefault();

    const confirmed = await confirmAction({
      title: "Update application status?",
      message: `${application.student.user.fullName} will be moved from ${application.status} to ${status}.`,
      detail: "Some workflow transitions are final or require an interview booking.",
      confirmText: "Update Status",
      tone: status === "REJECTED" ? "danger" : "warning"
    });

    if (!confirmed) return;

    setSubmitting(true);
    try {
      await api.updateApplicationStatus(applicationId, status);
      showToast("Application status updated.");
      navigate(`/recruiter/jobs/${state.application.jobId}/applications`);
    } catch (error) {
      setState((current) => ({ ...current, error }));
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) return <LoadingState label="Loading application" />;
  if (state.error) return <ErrorList error={state.error} />;

  const { application } = state;

  return (
    <section>
      <PageHeader
        eyebrow="Update Status"
        title={application.student.user.fullName}
        actions={
          <Link className="button ghost" to={`/recruiter/jobs/${application.jobId}/applications`}>
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      >
        {application.job.title}
      </PageHeader>

      <form className="panel form-grid" onSubmit={onSubmit}>
        <dl className="details-grid">
          <Detail label="Current Status" value={<StatusBadge status={application.status} />} />
          <Detail label="CGPA" value={application.student.cgpa} />
          <Detail label="Program" value={application.student.program} />
          <Detail label="Backlogs" value={application.student.backlogCount} />
        </dl>
        <SelectField label="New Status" name="status" value={status} onChange={(event) => setStatus(event.target.value)} options={applicationStatuses} required />
        <button className="button primary" type="submit" disabled={submitting}>
          <Check size={18} />
          {submitting ? "Updating" : "Update Status"}
        </button>
      </form>
    </section>
  );
}

export function InterviewSlotsPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const [state, setState] = useState({ loading: true, error: null });
  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [slotEdits, setSlotEdits] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    Promise.all([api.recruiterJob(id), api.slotsForJob(id)])
      .then(([job, slots]) => {
        const edits = Object.fromEntries(
          slots.map((slot) => [
            slot.id,
            {
              date: toDatetimeLocalValue(slot.date).slice(0, 10),
              startTime: toDatetimeLocalValue(slot.startTime),
              endTime: toDatetimeLocalValue(slot.endTime),
              status: slot.status
            }
          ])
        );
        setSlotEdits(edits);
        setState({ loading: false, job, slots, error: null });
      })
      .catch((error) => setState({ loading: false, error }));
  };

  useEffect(load, [id]);

  const onSlotFormChange = (event) => {
    setSlotForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const createSlot = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.createSlot({
        jobId: Number(id),
        date: new Date(slotForm.date).toISOString(),
        startTime: fromDatetimeLocalValue(slotForm.startTime),
        endTime: fromDatetimeLocalValue(slotForm.endTime)
      });
      setSlotForm(emptySlotForm);
      showToast("Interview slot created.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateSlot = async (slot) => {
    const edit = slotEdits[slot.id];
    try {
      await api.updateSlot(slot.id, {
        date: new Date(edit.date).toISOString(),
        startTime: fromDatetimeLocalValue(edit.startTime),
        endTime: fromDatetimeLocalValue(edit.endTime),
        status: edit.status
      });
      showToast("Slot updated.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const deleteSlot = async (slot) => {
    const confirmed = await confirmAction({
      title: "Delete interview slot?",
      message: `Delete the slot on ${formatDateTime(slot.startTime)}?`,
      detail: "Booked slots cannot be deleted.",
      confirmText: "Delete Slot",
      tone: "danger"
    });

    if (!confirmed) return;

    try {
      await api.deleteSlot(slot.id);
      showToast("Slot deleted.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const setSlotEdit = (slotId, patch) => {
    setSlotEdits((current) => ({
      ...current,
      [slotId]: {
        ...current[slotId],
        ...patch
      }
    }));
  };

  if (state.loading) return <LoadingState label="Loading interview slots" />;
  if (state.error) return <ErrorList error={state.error} />;

  return (
    <section>
      <PageHeader
        eyebrow="Interview Slots"
        title={state.job.title}
        actions={
          <Link className="button ghost" to={`/recruiter/jobs/${id}`}>
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      />

      <form className="panel form-grid three-column" onSubmit={createSlot}>
        <Field label="Date" name="date" type="date" value={slotForm.date} onChange={onSlotFormChange} required />
        <Field label="Start Time" name="startTime" type="datetime-local" value={slotForm.startTime} onChange={onSlotFormChange} required />
        <Field label="End Time" name="endTime" type="datetime-local" value={slotForm.endTime} onChange={onSlotFormChange} required />
        <button className="button primary grid-span" type="submit" disabled={submitting}>
          <Plus size={18} />
          {submitting ? "Creating" : "Create Slot"}
        </button>
      </form>

      <div className="list-stack">
        {state.slots.map((slot) => {
          const edit = slotEdits[slot.id] || {};
          const isBooked = slot.status === "BOOKED";
          return (
            <article className="list-item slot-editor" key={slot.id}>
              <div>
                <span className="eyebrow">Slot #{slot.id}</span>
                <h3>{formatDateTime(slot.startTime)}</h3>
                {slot.booking ? (
                  <p>Booked by {slot.booking.application.student.user.fullName}</p>
                ) : (
                  <p>{formatDateTime(slot.endTime)}</p>
                )}
              </div>
              <div className="slot-edit-grid">
                <input type="date" value={edit.date || ""} disabled={isBooked} onChange={(event) => setSlotEdit(slot.id, { date: event.target.value })} />
                <input type="datetime-local" value={edit.startTime || ""} disabled={isBooked} onChange={(event) => setSlotEdit(slot.id, { startTime: event.target.value })} />
                <input type="datetime-local" value={edit.endTime || ""} disabled={isBooked} onChange={(event) => setSlotEdit(slot.id, { endTime: event.target.value })} />
                <select value={edit.status || slot.status} disabled={isBooked} onChange={(event) => setSlotEdit(slot.id, { status: event.target.value })}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="CANCELLED">CANCELLED</option>
                  {isBooked ? <option value="BOOKED">BOOKED</option> : null}
                </select>
              </div>
              <div className="list-actions">
                <StatusBadge status={slot.status} />
                <button className="icon-button" type="button" onClick={() => updateSlot(slot)} disabled={isBooked} aria-label="Update slot" title="Update slot">
                  <Save size={17} />
                </button>
                <button className="icon-button danger" type="button" onClick={() => deleteSlot(slot)} disabled={isBooked} aria-label="Delete slot" title="Delete slot">
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!state.slots.length ? (
        <EmptyState title="No slots" text="Create interview slots for shortlisted students." />
      ) : null}
    </section>
  );
}

function RecruiterJobList({ jobs, onDelete }) {
  if (!jobs.length) {
    return (
      <EmptyState
        title="No jobs"
        text="Create the first posting with eligibility criteria and a deadline."
        action={
          <Link className="button primary" to="/recruiter/jobs/new">
            <Plus size={17} />
            Create Job
          </Link>
        }
      />
    );
  }

  return (
    <div className="card-grid">
      {jobs.map((job) => (
        <article className="card" key={job.id}>
          <div className="card-topline">
            <span>{job.location || "Location not set"}</span>
            <span>{job.isPublished ? "Published" : "Draft"}</span>
          </div>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <dl className="mini-details">
            <Detail label="Applications" value={job._count?.applications || 0} />
            <Detail label="Slots" value={job._count?.interviewSlots || 0} />
            <Detail label="Deadline" value={formatDate(job.applicationDeadline)} />
          </dl>
          <div className="button-row">
            <Link className="button ghost" to={`/recruiter/jobs/${job.id}`}>
              <Eye size={17} />
              Details
            </Link>
            <Link className="button secondary" to={`/recruiter/jobs/${job.id}/edit`}>
              <Edit3 size={17} />
              Edit
            </Link>
            {onDelete ? (
              <button className="icon-button danger" type="button" onClick={() => onDelete(job)} aria-label="Delete job" title="Delete job">
                <Trash2 size={17} />
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function RecruiterApplicationList({ applications, onQuickUpdate }) {
  if (!applications.length) {
    return (
      <EmptyState
        title="No applications"
        text="Student applications for your jobs will appear here."
      />
    );
  }

  return (
    <div className="list-stack">
      {applications.map((application) => (
        <article className="list-item" key={application.id}>
          <div>
            <span className="eyebrow">{application.job.title}</span>
            <h3>{application.student.user.fullName}</h3>
            <p>
              {application.student.program} - CGPA {application.student.cgpa} -
              Backlogs {application.student.backlogCount}
            </p>
          </div>
          <div className="list-actions">
            <StatusBadge status={application.status} />
            {onQuickUpdate && application.status === "APPLIED" ? (
              <>
                <button className="button secondary" type="button" onClick={() => onQuickUpdate(application, "SHORTLISTED")}>
                  <Check size={17} />
                  Shortlist
                </button>
                <button className="button danger" type="button" onClick={() => onQuickUpdate(application, "REJECTED")}>
                  Reject
                </button>
              </>
            ) : null}
            <Link className="button ghost" to={`/recruiter/applications/${application.id}/status`}>
              <ClipboardList size={17} />
              Update
            </Link>
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
