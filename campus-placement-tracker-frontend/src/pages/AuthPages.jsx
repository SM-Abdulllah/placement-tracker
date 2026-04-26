import { ArrowRight, BriefcaseBusiness, GraduationCap, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ErrorList } from "../components/Feedback.jsx";
import { Field } from "../components/Form.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const redirectFor = (role) =>
  role === "RECRUITER" ? "/recruiter/dashboard" : "/student/dashboard";

export function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link className="brand" to="/">
          <GraduationCap size={28} />
          <span>Campus Placement</span>
        </Link>
        <div>
          <Link className="button ghost" to="/login">
            <LogIn size={17} />
            Login
          </Link>
        </div>
      </nav>

      <section className="landing-grid">
        <div className="landing-copy">
          <span className="eyebrow">Placement workflow hub</span>
          <h1>Campus Placement Tracker</h1>
          <p>
            Students apply with verified academic data, recruiters manage
            eligibility-driven jobs, and interviews move from shortlist to booked
            slot without scheduling conflicts.
          </p>
          <div className="landing-actions">
            <Link className="button primary" to="/register/student">
              <GraduationCap size={18} />
              Student Register
            </Link>
            <Link className="button secondary" to="/register/recruiter">
              <BriefcaseBusiness size={18} />
              Recruiter Register
            </Link>
          </div>
        </div>

        <div className="workflow-board" aria-label="Placement workflow preview">
          <div className="workflow-column">
            <strong>Eligible Jobs</strong>
            <span>Software Engineer Intern</span>
            <span>Data Analyst Trainee</span>
          </div>
          <div className="workflow-column accent">
            <strong>Applications</strong>
            <span>APPLIED</span>
            <span>SHORTLISTED</span>
          </div>
          <div className="workflow-column success">
            <strong>Interviews</strong>
            <span>Slot available</span>
            <span>Conflict checked</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError({ message: "Email and password are required." });
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(form);
      showToast("Login successful.");
      const fallback = redirectFor(user.role);
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame
      title="Login"
      text="Use your student or recruiter account."
      aside="Seed credentials are listed in the README after setup."
    >
      <form className="form-card" onSubmit={onSubmit}>
        <ErrorList error={error} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
        <button className="button primary full" type="submit" disabled={submitting}>
          <LogIn size={18} />
          {submitting ? "Signing in" : "Sign in"}
        </button>
        <div className="form-links">
          <Link to="/register/student">Student register</Link>
          <Link to="/register/recruiter">Recruiter register</Link>
        </div>
      </form>
    </AuthFrame>
  );
}

export function StudentRegisterPage() {
  const { registerStudent } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    rollNumber: "",
    cgpa: "",
    program: "",
    backlogCount: "0",
    semester: ""
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (Number(form.cgpa) < 0 || Number(form.cgpa) > 4) {
      setError({ message: "CGPA must be between 0 and 4.0." });
      return;
    }

    setSubmitting(true);
    try {
      await registerStudent({
        ...form,
        cgpa: Number(form.cgpa),
        backlogCount: Number(form.backlogCount || 0),
        semester: form.semester ? Number(form.semester) : undefined
      });
      showToast("Student account created.");
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame title="Student Register" text="Academic data is stored once and used by the backend for application eligibility.">
      <form className="form-card two-column" onSubmit={onSubmit}>
        <ErrorList error={error} />
        <Field label="Full Name" name="fullName" value={form.fullName} onChange={onChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
        <Field label="Roll Number" name="rollNumber" value={form.rollNumber} onChange={onChange} required />
        <Field label="CGPA" name="cgpa" type="number" min="0" max="4" step="0.01" value={form.cgpa} onChange={onChange} required />
        <Field label="Program/Major" name="program" value={form.program} onChange={onChange} placeholder="BSCS" required />
        <Field label="Backlog Count" name="backlogCount" type="number" min="0" value={form.backlogCount} onChange={onChange} required />
        <Field label="Semester" name="semester" type="number" min="1" value={form.semester} onChange={onChange} required />
        <button className="button primary full grid-span" type="submit" disabled={submitting}>
          <ArrowRight size={18} />
          {submitting ? "Creating account" : "Create student account"}
        </button>
      </form>
    </AuthFrame>
  );
}

export function RecruiterRegisterPage() {
  const { registerRecruiter } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyEmail: "",
    companyPhone: ""
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await registerRecruiter(form);
      showToast("Recruiter account created.");
      navigate("/recruiter/dashboard", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame title="Recruiter Register" text="Create a recruiter workspace for jobs, applications, and interview slots.">
      <form className="form-card two-column" onSubmit={onSubmit}>
        <ErrorList error={error} />
        <Field label="Full Name" name="fullName" value={form.fullName} onChange={onChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
        <Field label="Company Name" name="companyName" value={form.companyName} onChange={onChange} required />
        <Field label="Company Email" name="companyEmail" type="email" value={form.companyEmail} onChange={onChange} />
        <Field label="Company Phone" name="companyPhone" value={form.companyPhone} onChange={onChange} />
        <button className="button primary full grid-span" type="submit" disabled={submitting}>
          <ArrowRight size={18} />
          {submitting ? "Creating account" : "Create recruiter account"}
        </button>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({ title, text, aside, children }) {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" to="/">
        <GraduationCap size={28} />
        <span>Campus Placement</span>
      </Link>
      <section className="auth-grid">
        <div className="auth-copy">
          <span className="eyebrow">Secure access</span>
          <h1>{title}</h1>
          <p>{text}</p>
          {aside ? <div className="alert subtle-alert">{aside}</div> : null}
        </div>
        {children}
      </section>
    </main>
  );
}
