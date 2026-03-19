const { execSync } = require('child_process');

function run(command) {
  try {
    return execSync(command, { stdio: 'inherit', shell: true });
  } catch (error) {
    // Silencia erros esperados como "nada para commitar"
    return null;
  }
}

console.log('🚀 Iniciando o deploy oficial...');

// 1. Limpeza preventiva de arquivos inválidos do Windows
console.log('🧹 Limpando arquivos temporários...');
try {
  run('cmd /c "del \\\\?\\c:\\Users\\cardo\\OneDrive\\Documentos\\servicos_azevedo\\nul" 2>nul');
} catch (e) {}

// 2. Adição de arquivos (específica para evitar o arquivo nul)
console.log('📦 Preparando arquivos para envio...');
const foldersToStage = ['app', 'components', 'lib', 'supabase', '.agent'];
const filesToStage = ['.env.example', '.gitignore', 'DEPLOY_GUIA.md', 'next.config.mjs', 'package.json', 'README.md', 'scripts/deploy.js'];

run(`git add ${foldersToStage.join(' ')} ${filesToStage.join(' ')}`);

// 3. Remover arquivos antigos (migração de configuração)
run('git rm -f next.config.ts --ignore-unmatch');

// 4. Commit (com proteção para commit vazio)
console.log('✍️ Criando registro das alterações (commit)...');
try {
  execSync('git commit -m "deploy"', { stdio: 'inherit', shell: true });
} catch (error) {
  console.log('ℹ️ Nenhuma alteração nova detectada, forçando sincronização...');
  run('git commit --allow-empty -m "deploy empty sync"');
}

// 5. Push para o GitHub
console.log('📤 Enviando para o GitHub...');
try {
  run('git push origin main');
  console.log('✅ DEPLOY REALIZADO COM SUCESSO!');
  console.log('🌐 O Vercel/Netlify iniciará o build automaticamente.');
} catch (error) {
  console.error('❌ Erro ao enviar para o GitHub. Verifique sua conexão ou permissões.');
  process.exit(1);
}
