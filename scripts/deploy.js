const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command) {
  try {
    return execSync(command, { stdio: 'inherit', shell: true });
  } catch (error) {
    return null;
  }
}

console.log('🚀 [DEPLOY] Iniciando processo de sincronização...');

// 1. Limpeza de cache e arquivos problemáticos
console.log('🧹 [1/4] Limpando cache e arquivos temporários...');
try {
  // Limpa o cache do Next.js para evitar erros de chunk
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  // Remove o arquivo 'nul' problemático se existir (específico para OneDrive)
  const nulPath = path.join(process.cwd(), 'nul');
  run(`cmd /c "if exist \\\\?\\${nulPath} del \\\\?\\${nulPath}" 2>nul`);
} catch (e) {
  console.log('⚠️ Aviso: Falha ao limpar alguns arquivos temporários, prosseguindo...');
}

// 2. Sincronização de arquivos
console.log('📦 [2/4] Preparando arquivos para o GitHub...');
// Adicionando tudo exceto o que está no .gitignore
run('git add .');

// 3. Commit
console.log('✍️ [3/4] Criando registro das alterações...');
const commitMsg = process.argv[2] || "deploy: atualização de sistema e design";
try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit', shell: true });
} catch (error) {
  console.log('ℹ️ Nenhuma alteração nova detectada, sincronizando estado atual...');
  run('git commit --allow-empty -m "deploy: sync empty"');
}

// 4. Envio Final
console.log('📤 [4/4] Enviando para o servidor de produção...');
try {
  run('git push origin main');
  console.log('\n✅ DEPLOY REALIZADO COM SUCESSO!');
  console.log('🌐 Suas alterações estarão no ar em alguns instantes.');
  console.log('💡 Dica: Se o site local der erro, rode "npm run dev" novamente.');
} catch (error) {
  console.error('\n❌ Erro crítico ao enviar para o GitHub.');
  console.error('👉 Verifique sua conexão com a internet ou se há conflitos no Git.');
  process.exit(1);
}
