requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

const quizId = urlParam('id');
if (!quizId) window.location.href = '/dashboard.html';

let questions = [], currentIndex = 0, answers = {}, submitted = {};

async function init() {
  const { quiz, questions: qs } = await apiFetch(`/api/quizzes/${quizId}`);
  questions = qs;
  document.getElementById('quizTitle').textContent = quiz.title;
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('quizView').style.display = '';
  showQuestion();
}

function showQuestion() {
  if (currentIndex >= questions.length) { showResults(); return; }
  const q = questions[currentIndex];
  const pct = Math.round((currentIndex / questions.length) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${currentIndex + 1} / ${questions.length}`;

  const area = document.getElementById('questionArea');
  const isAnswered = submitted[q.id];

  if (q.type === 'multiple_choice') {
    area.innerHTML = `
      <div style="font-size:.75rem;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:.75rem;">Multiple Choice</div>
      <p style="font-size:1.1rem;font-weight:700;color:var(--text);margin:0 0 1.25rem;">${escHtml(q.question)}</p>
      <div style="display:flex;flex-direction:column;gap:.5rem;" id="optionsList">
        ${(q.options || []).map(opt => {
          let cls = 'quiz-option';
          if (isAnswered) {
            cls += ' disabled';
            if (opt === q.correct) cls += ' correct';
            else if (opt === answers[q.id] && opt !== q.correct) cls += ' incorrect';
          } else if (answers[q.id] === opt) cls += ' selected';
          return `<label class="${cls}" data-opt="${escHtml(opt)}">
            <span style="width:22px;height:22px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0;">${opt.charAt(0)}</span>
            <span>${escHtml(opt)}</span>
          </label>`;
        }).join('')}
      </div>
      ${isAnswered && q.explanation ? `<div style="margin-top:1rem;padding:.875rem;background:var(--primary-dim);border-radius:var(--radius-sm);font-size:.875rem;color:var(--text-2);">💡 ${escHtml(q.explanation)}</div>` : ''}
    `;
    if (!isAnswered) {
      area.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          answers[q.id] = opt.dataset.opt;
          area.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
        });
      });
    }
  } else {
    // Open question
    area.innerHTML = `
      <div style="font-size:.75rem;font-weight:700;color:#0EA5E9;text-transform:uppercase;margin-bottom:.75rem;">Open Question</div>
      <p style="font-size:1.1rem;font-weight:700;color:var(--text);margin:0 0 1.25rem;">${escHtml(q.question)}</p>
      ${isAnswered ? `
        <div style="padding:1rem;background:var(--surface2);border-radius:var(--radius-sm);font-size:.875rem;color:var(--text-2);margin-bottom:.75rem;">${escHtml(answers[q.id] || '(no answer)')}</div>
        <div style="padding:1rem;background:#D1FAE5;border-radius:var(--radius-sm);">
          <div style="font-size:.75rem;font-weight:700;color:#065F46;margin-bottom:.25rem;">MODEL ANSWER</div>
          <p style="font-size:.875rem;color:#065F46;margin:0 0 .5rem;">${escHtml(q.sample_answer || '')}</p>
          ${q.keywords?.length ? `<p style="font-size:.75rem;color:#065F46;margin:0;">Key terms: ${q.keywords.map(k => `<strong>${escHtml(k)}</strong>`).join(', ')}</p>` : ''}
        </div>
      ` : `
        <textarea class="sb-textarea" id="openAnswer" rows="4" placeholder="Write your answer here…" style="min-height:120px;">${escHtml(answers[q.id] || '')}</textarea>
      `}
    `;
  }

  // Nav button
  const submitBtn = document.getElementById('submitBtn');
  if (isAnswered) {
    submitBtn.textContent = currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results';
    submitBtn.onclick = () => { currentIndex++; showQuestion(); };
  } else {
    submitBtn.textContent = 'Check Answer';
    submitBtn.onclick = () => {
      if (q.type === 'open') {
        answers[q.id] = document.getElementById('openAnswer')?.value || '';
      }
      if (q.type === 'multiple_choice' && !answers[q.id]) {
        showToast('Please select an answer', 'error'); return;
      }
      submitted[q.id] = true;
      showQuestion();
    };
  }
}

function showResults() {
  document.getElementById('quizView').style.display = 'none';
  document.getElementById('resultsView').style.display = '';

  const mcqs = questions.filter(q => q.type === 'multiple_choice');
  const correct = mcqs.filter(q => answers[q.id] === q.correct).length;
  const pct = mcqs.length ? Math.round((correct / mcqs.length) * 100) : 0;

  document.getElementById('scoreDisplay').textContent = `${correct}/${mcqs.length}`;
  document.getElementById('scoreFill').style.width = pct + '%';

  const openQs = questions.filter(q => q.type === 'open');
  if (openQs.length) {
    document.getElementById('openAnswerReview').innerHTML = `
      <div style="font-weight:700;color:var(--text);margin-bottom:.75rem;">Open Question Review</div>
      ${openQs.map(q => `
        <div class="sb-card" style="padding:1rem;margin-bottom:.75rem;text-align:left;">
          <p style="font-weight:600;color:var(--text);font-size:.875rem;margin:0 0 .5rem;">${escHtml(q.question)}</p>
          <p style="font-size:.8rem;color:var(--text-2);margin:0 0 .5rem;"><strong>Your answer:</strong> ${escHtml(answers[q.id] || '(no answer)')}</p>
          <p style="font-size:.8rem;color:#065F46;margin:0;"><strong>Model answer:</strong> ${escHtml(q.sample_answer || '')}</p>
        </div>
      `).join('')}
    `;
  }
}

init();
