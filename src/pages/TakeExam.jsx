import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomMathEditor from '../components/CustomMathEditor';
import MathPreview from '../components/MathPreview';

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('student');

    if (!saved) {
      navigate('/student-login');
      return;
    }

    setStudent(JSON.parse(saved));

    const fetchData = async () => {
      try {
        const [examRes, qRes] = await Promise.all([
          fetch(`/api/exams/${examId}`),
          fetch(`/api/questions/exam/${examId}`),
        ]);

        const examData = await examRes.json();
        const qData = await qRes.json();

        setExam(examData);
        setQuestions(qData);
        setTimeLeft(examData.duration * 60);
      } catch (err) {
        alert('Could not load exam.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, navigate]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectAnswer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const stripHTML = (html) => {
    return html
      .toString()
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
      .toLowerCase();
  };

  const handleSubmit = async () => {
    if (submitted) return;

    let score = 0;

    questions.forEach((q) => {
      if (q.type === 'fillblank') {
        const studentAnswer = stripHTML(answers[q._id] || '');
        const correct = (q.correctAnswer || '').toString().trim().toLowerCase();

        if (studentAnswer === correct) {
          score += q.marks;
        }
      } else {
        if (answers[q._id] === q.correctIndex) {
          score += q.marks;
        }
      }
    });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= exam.passingScore;

    setSubmitted(true);
    setResult({ score, totalMarks, percentage, passed });

    try {
      await fetch(`/api/students/${student._id}/exam-result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, score, status: 'completed' }),
      });

      const updatedStudent = {
        ...student,
        exams: [
          ...(student.exams || []).filter((e) => e.examId !== examId),
          {
            examId,
            examTitle: exam.title,
            score,
            status: 'completed',
          },
        ],
      };

      localStorage.setItem('student', JSON.stringify(updatedStudent));
    } catch (err) {
      console.log('Could not save result');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Loading exam...</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <p style={{ fontSize: 16, color: '#9ca3af' }}>
          No questions found for this exam.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/student-dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div style={{ width: '100%', maxWidth: 500 }}>
          <div
            style={{
              background: result.passed ? '#059669' : '#dc2626',
              borderRadius: 16,
              padding: '32px 28px',
              textAlign: 'center',
              color: '#fff',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {result.passed ? '🎉' : '😔'}
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              {result.passed ? 'Congratulations!' : 'Better luck next time!'}
            </div>

            <div style={{ fontSize: 14, opacity: 0.85 }}>
              {result.passed ? 'You passed the exam!' : 'You did not pass this time.'}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: result.passed ? '#059669' : '#dc2626',
                }}
              >
                {result.percentage}%
              </div>

              <div style={{ fontSize: 14, color: '#9ca3af' }}>
                {result.score} out of {result.totalMarks} marks
              </div>
            </div>

            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div className="metric-card" style={{ textAlign: 'center' }}>
                <div className="metric-label">Score</div>
                <div className="metric-value" style={{ fontSize: 20, color: '#1d4ed8' }}>
                  {result.score}
                </div>
              </div>

              <div className="metric-card" style={{ textAlign: 'center' }}>
                <div className="metric-label">Passing</div>
                <div className="metric-value" style={{ fontSize: 20, color: '#b45309' }}>
                  {exam.passingScore}%
                </div>
              </div>

              <div className="metric-card" style={{ textAlign: 'center' }}>
                <div className="metric-label">Result</div>
                <div
                  className="metric-value"
                  style={{
                    fontSize: 20,
                    color: result.passed ? '#059669' : '#dc2626',
                  }}
                >
                  {result.passed ? 'Pass' : 'Fail'}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Answer Review</div>

            {questions.map((q, i) => {
              const selected = answers[q._id];

              return (
                <div
                  key={q._id}
                  style={{
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottom: i < questions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>
                    Q{i + 1} · {q.marks} mark{q.marks > 1 ? 's' : ''}
                  </div>

                  <div style={{ fontWeight: 500, marginBottom: 8 }}>
                    <MathPreview value={q.text} />
                  </div>

                  {q.type === 'fillblank' && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 13,
                        background: selected ? '#eff6ff' : '#fef2f2',
                        border: `1px solid ${selected ? '#93c5fd' : '#fca5a5'}`,
                        color: selected ? '#1d4ed8' : '#dc2626',
                      }}
                    >
                      {selected ? (
                        <span>
                          Your answer:{' '}
                          <span><MathPreview value={selected} /></span>
                        </span>
                      ) : (
                        '⚠️ Not answered'
                      )}
                    </div>
                  )}

                  {(q.type === 'mcq' || q.type === 'truefalse') && (
                    <>
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            marginBottom: 4,
                            fontSize: 13,
                            background: j === selected ? '#eff6ff' : '#f9fafb',
                            border: `1px solid ${j === selected ? '#93c5fd' : '#e5e7eb'}`,
                            color: j === selected ? '#1d4ed8' : '#1f2937',
                            fontWeight: j === selected ? 500 : 400,
                          }}
                        >
                          <strong>{String.fromCharCode(65 + j)}.</strong>{' '}
                          <span><MathPreview value={opt} /></span>
                          {j === selected && ' ← Your answer'}
                        </div>
                      ))}

                      {selected === undefined && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                          ⚠️ Not answered
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px 16px',
            }}
            onClick={() => navigate('/student-dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{exam.title}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            {exam.subject} · {questions.length} questions
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: timeLeft < 60 ? '#fef2f2' : '#eff6ff',
              color: timeLeft < 60 ? '#dc2626' : '#1d4ed8',
              padding: '6px 14px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              fontFamily: 'monospace',
            }}
          >
            ⏱ {formatTime(timeLeft)}
          </div>

          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            {answered}/{questions.length} answered
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {questions.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background:
                  i === current
                    ? '#1d4ed8'
                    : answers[questions[i]._id] !== undefined
                    ? '#059669'
                    : '#e5e7eb',
                color:
                  i === current || answers[questions[i]._id] !== undefined
                    ? '#fff'
                    : '#4b5563',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
            Question {current + 1} of {questions.length} · {q.marks} mark
            {q.marks > 1 ? 's' : ''}
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            <MathPreview value={q.text} />
          </div>

          {q.type === 'fillblank' && (
            <div style={{ marginTop: 8 }}>
              <CustomMathEditor
                value={answers[q._id] !== undefined ? answers[q._id] : ''}
                onChange={(val) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q._id]: val,
                  }))
                }
                placeholder="Type your answer here. Use the Math/Chem buttons above."
              />

              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                💡 Spelling matters for fill-in-the-blank questions.
              </div>
            </div>
          )}

          {(q.type === 'mcq' || q.type === 'truefalse') &&
            q.options.map((opt, j) => (
              <div
                key={j}
                onClick={() => selectAnswer(q._id, j)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                  border: `1.5px solid ${answers[q._id] === j ? '#1d4ed8' : '#e5e7eb'}`,
                  background: answers[q._id] === j ? '#eff6ff' : '#fff',
                  color: answers[q._id] === j ? '#1d4ed8' : '#1f2937',
                  fontWeight: answers[q._id] === j ? 500 : 400,
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${answers[q._id] === j ? '#1d4ed8' : '#d1d5db'}`,
                    background: answers[q._id] === j ? '#1d4ed8' : 'transparent',
                    flexShrink: 0,
                  }}
                />

                <strong>{String.fromCharCode(65 + j)}.</strong>
                <span><MathPreview value={opt} /></span>
              </div>
            ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={() => setCurrent((c) => c - 1)}
            disabled={current === 0}
          >
            ← Previous
          </button>

          {current < questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ background: '#059669', borderColor: '#059669' }}
              onClick={() => {
                const unanswered = questions.length - answered;

                if (unanswered > 0) {
                  const confirmSubmit = window.confirm(
                    `You have ${unanswered} unanswered question${
                      unanswered > 1 ? 's' : ''
                    }. Submit anyway?`
                  );

                  if (!confirmSubmit) return;
                }

                handleSubmit();
              }}
            >
              ✅ Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}