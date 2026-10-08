import { useState } from 'react'
import './App.css'

const initialState = {
  name: '',
  age: '',
  annualIncome: '',
  householdSize: '',
  gender: 'female',
  disability: false,
  employmentStatus: 'employed',
  residentState: 'Maharashtra',
  category: 'general',
}

function App() {
  const [form, setForm] = useState(initialState)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          annualIncome: Number(form.annualIncome),
          householdSize: Number(form.householdSize),
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to fetch eligibility result.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong while checking eligibility.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Government Support Portal</p>
          <h1>Eligibility Checker</h1>
        </div>
      </header>

      <main className="layout">
        <section className="card form-card">
          <h2>Applicant Details</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Full Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Age
              <input name="age" type="number" min="0" value={form.age} onChange={handleChange} required />
            </label>

            <label>
              Annual Income (₹)
              <input name="annualIncome" type="number" min="0" value={form.annualIncome} onChange={handleChange} required />
            </label>

            <label>
              Household Size
              <input name="householdSize" type="number" min="1" value={form.householdSize} onChange={handleChange} required />
            </label>

            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Employment Status
              <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </label>

            <label>
              State / Region
              <select name="residentState" value={form.residentState} onChange={handleChange}>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="rural">Rural</option>
              </select>
            </label>

            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="general">General</option>
                <option value="obc">OBC</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
              </select>
            </label>

            <label className="checkbox-row">
              <input type="checkbox" name="disability" checked={form.disability} onChange={handleChange} />
              Person with disability
            </label>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Checking...' : 'Check Eligibility'}
            </button>
          </form>

          {error && <p className="error-box">{error}</p>}
        </section>

        <aside className="card result-card">
          <h2>Results</h2>
          {!result ? (
            <p className="muted">Your eligibility summary will appear here.</p>
          ) : (
            <>
              <div className={`status-badge ${result.eligible ? 'eligible' : 'ineligible'}`}>
                {result.eligible ? 'Eligible' : 'Not Eligible'}
              </div>
              <p>{result.summary}</p>
              {result.aiSummary && (
                <div className="ai-summary-box">
                  <h3>AI Recommendation</h3>
                  <p>{result.aiSummary}</p>
                </div>
              )}
              <ul>
                {result.matchedSchemes && result.matchedSchemes.length > 0 ? (
                  result.matchedSchemes.map((scheme, index) => (
                    <li key={index}>
                      <strong>{scheme.schemeName}</strong>
                      <p>{scheme.description}</p>
                      <small>{scheme.eligibilityRule}</small>
                    </li>
                  ))
                ) : (
                  <li>No schemes matched this profile.</li>
                )}
              </ul>
            </>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
