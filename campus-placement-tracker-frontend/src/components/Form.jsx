export function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  readOnly = false,
  min,
  max,
  step,
  placeholder,
  children
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  rows = 5,
  placeholder
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? <em>*</em> : null}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? <em>*</em> : null}
      </span>
      <select name={name} value={value} onChange={onChange} required={required}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProgramPicker({ selected, onChange }) {
  const toggleProgram = (program) => {
    const next = selected.includes(program)
      ? selected.filter((item) => item !== program)
      : [...selected, program];
    onChange(next);
  };

  const allPrograms = ["BSCS", "BSSE", "BSIT", "BBA", "BSDS", "BSEE"];

  return (
    <div className="field">
      <span>
        Allowed Programs<em>*</em>
      </span>
      <div className="chip-grid">
        {allPrograms.map((program) => (
          <label className="check-chip" key={program}>
            <input
              type="checkbox"
              checked={selected.includes(program)}
              onChange={() => toggleProgram(program)}
            />
            <span>{program}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
