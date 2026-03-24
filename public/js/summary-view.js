requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

const summaryId = urlParam('id');
if (!summaryId) window.location.href = '/dashboard.html';

async function init() {
  const { summary } = await apiFetch(`/api/summaries/${summaryId}`);
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('summaryView').style.display = '';
  document.getElementById('summaryTitle').textContent = summary.title;
  document.getElementById('summaryTopic').textContent = summary.topic || '';
  document.title = `${summary.title} — StudyBuild`;

  // Render markdown to HTML (basic parser)
  document.getElementById('summaryContent').innerHTML = renderMarkdown(summary.content);
}

function renderMarkdown(md) {
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // Restore escaped HTML tags we want to render
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li><strong>$1.</strong> $2</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, (match) => `<ul style="padding-left:1.25rem;margin:.5rem 0;">${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, (line) => line.startsWith('<') ? line : `<p>${line}</p>`)
    .replace(/<p><\/p>/g, '');
}

init();
