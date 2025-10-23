// Login

async function logar(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    // Coleta os dados do formulário
    const email = document.getElementById('email_login').value;
    const pass = document.getElementById('password_login').value;

    // Verifica se os campos estão preenchidos
    if (!email || !pass) {
        alert("Todos os campos devem ser preenchidos!");
        return;
    }

    // Cria o objeto com os dados a serem enviados para a API
    const data = { email, pass };

    try {
        const response = await fetch("http://localhost:3005/login", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data),
        });

        let results = await response.json();

        if (results.success) {
            alert(results.message);

            // Armazena os dados do usuário (já sem a senha) no localStorage
            let userData = results.data;
            localStorage.setItem('informacoes', JSON.stringify(userData));

            // --- CORREÇÃO AQUI ---
            // Alterado de 'userData.perfil' para 'userData.profile' para corresponder
            // ao nome da coluna no banco de dados ('profile').
            const perfil = userData.profile; 
            const userId = userData.id;     // Pega o ID do usuário para passar na URL

            switch (perfil) {
                case 'professor':
                    // Redireciona para o painel do professor, passando o ID na URL
                    window.location.href = `../painel/prof.html?userId=${userId}`;
                    break;
                
                case 'administrador':
                    // O administrador vai para a home com os cards de gerenciamento
                    window.location.href = "../home/index.html";
                    break;

                case 'aluno':
                    // Você pode criar esta página depois
                    window.location.href = `../painel/portal_aluno.html?userId=${userId}`;
                    break;
                
                case 'pedagogo':
                     // Você pode criar esta página depois
                    window.location.href = `../painel/portal_pedagogo.html?userId=${userId}`;
                    break;

                default:
                    // Caso o perfil não seja reconhecido, vai para a home padrão
                    alert("Perfil de usuário não reconhecido. Redirecionando para a home.");
                    window.location.href = "../home/index.html";
                    break;
            }
            // --- FIM DA CORREÇÃO ---
            
        } else {
            alert(results.message);
        }
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        alert("Erro ao realizar login. Tente novamente mais tarde.");
    }
}


// Logout 

function logout() {
    // Remove os dados do usuário do localStorage
    localStorage.removeItem('informacoes');

    // Redireciona para a página de login
    window.location.href = "login/login.html";
}

// Reenvia para a tela de login, caso o login não tenha sido feito (Tem que arrumar)

// window.onload = function() {
//     let userData = localStorage.getItem('Informacoes');
    
//     if (!userData) {
//         // Se não há dados de login, redireciona para a página de login
//         window.location.href = "";
//     } else {
//         // Caso o usuário esteja logado, você pode exibir as informações dele
//         userData = JSON.parse(userData);
//         document.getElementById('user-info').innerHTML = `Bem-vindo, ${userData.name} - Perfil: ${userData.perfil}`;
//     }
// }

// 

async function cadastrarClass(event) {
    event.preventDefault();  // Previne o comportamento padrão do formulário

    // Coleta os dados do formulário
    const className = document.getElementById('className').value;
    const classGrade = document.getElementById('classGrade').value;
    const shift = document.getElementById('classShift').value;
    const capacity = document.getElementById('classCapacity').value;

    // Verifica se os campos estão preenchidos
    if (!className || !classGrade || !shift || !capacity) {
        alert("Todos os campos devem ser preenchidos!");
        return;
    }

    // Cria o objeto com os dados a serem enviados para a API
    const data = { className, classGrade, shift, capacity };

    try {
        // Realiza a requisição POST para a API
        const response = await fetch('http://localhost:3005/turma/cadastrar', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);

            carregarTurmas();

            // Limpa os campos do formulário
            document.getElementById('addClassForm').reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro durante o cadastro:', error);
        alert("Ocorreu um erro ao tentar realizar o cadastro.");
    }
}



//  Modal-Card

const classForm = document.getElementById('addClassForm');
const formTitle = document.querySelector('.modal-section h2');

window.onload = carregarTurmas;

async function carregarTurmas() {
  const container = document.getElementById('classList');
  container.innerHTML = ''; // Limpar antes de renderizar

  try {
    const response = await fetch('http://localhost:3005/turma/listar');
    const turmas = await response.json();

    turmas.forEach(turma => {
      const div = document.createElement('div');
      div.className = 'class-item';
      
      // CORREÇÕES AQUI:
      // 1. Usar 'turma.id' ao invés de 'turma.id_turma'.
      // 2. Usar 'turma.name', 'turma.grade', 'turma.shift' para passar os dados corretos.
      div.innerHTML = `
          <span class="class-name">${turma.name} - ${turma.grade} (${turma.shift})</span>
          <div class="class-buttons">
            <button class="edit-btn" onclick="prepararEdicao(${turma.id}, '${turma.name}', '${turma.grade}', '${turma.shift}', ${turma.capacity})" title="Editar"></button>
            <button class="delete-btn" onclick="excluirTurma(${turma.id})" title="Excluir Turma"></button>
          </div>
        `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
  }
}

// NOVA FUNÇÃO: Prepara o formulário para edição
function prepararEdicao(id, name, grade, shift, capacity) {
  // Muda o título do formulário
  formTitle.textContent = "Editar Turma";

  // Preenche os campos do formulário com os dados da turma
  document.getElementById('className').value = name;
  document.getElementById('classGrade').value = grade;
  document.getElementById('classShift').value = shift;
  document.getElementById('classCapacity').value = capacity;

  // Armazena o ID da turma que está sendo editada diretamente no formulário
  // Usamos um 'data-attribute' para isso, é uma boa prática.
  classForm.setAttribute('data-editing-id', id);
}

// Lógica de envio do formulário (Criação e Atualização)
classForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const id = classForm.getAttribute('data-editing-id'); // Pega o ID (se estiver editando)

    // Pega os valores dos campos
    const name = document.getElementById('className').value;
    const grade = document.getElementById('classGrade').value;
    const shift = document.getElementById('classShift').value;
    const capacity = document.getElementById('classCapacity').value;

    if (!name || !grade || !shift || !capacity) {
        alert("Todos os campos devem ser preenchidos!");
        return;
    }

    // Monta o corpo da requisição
    const data = { name, grade, shift, capacity };

    let url = 'http://localhost:3005/turma/cadastrar';
    let method = 'POST';

    // Se tiver um ID, estamos editando. Mude a URL e o método.
    if (id) {
        url = `http://localhost:3005/turma/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            resetarFormulario(); // Limpa o formulário e volta ao modo de cadastro
            carregarTurmas(); // Atualiza a lista
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro ao salvar turma:', error);
        alert("Ocorreu um erro ao tentar salvar a turma.");
    }
});

// NOVA FUNÇÃO: Para limpar o formulário e resetar o estado de edição
function resetarFormulario() {
    formTitle.textContent = "Cadastrar Nova Turma"; // Volta o título ao original
    classForm.reset(); // Limpa os campos
    classForm.removeAttribute('data-editing-id'); // Remove o ID de edição
}

// SUA FUNÇÃO DE EXCLUIR (agora deve funcionar corretamente)
async function excluirTurma(id) {
  if (!confirm("Tem certeza que deseja excluir esta turma?")) return;

  try {
    const response = await fetch(`http://localhost:3005/turma/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (response.ok) {
      alert("Turma excluída!");
      carregarTurmas(); // Recarrega a lista
    } else {
      alert("Erro ao excluir: " + result.message);
    }
  } catch (error) {
    alert("Erro ao conectar com o servidor para excluir a turma.");
    console.error(error);
  }
}

// Professor

const openTeacherModalCard = document.getElementById('openTeacherModalCard');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherButton = document.querySelector('.close-teacher-button');
const teacherForm = document.getElementById('teacherForm');
const teacherFormTitle = document.getElementById('teacherFormTitle');
const teacherListContainer = document.getElementById('teacherList');

// Abrir e fechar o modal
openTeacherModalCard.addEventListener('click', () => {
    teacherModal.style.display = 'block';
    carregarProfessores(); // Carrega a lista de professores
    popularDropdownsParaVinculo(); // Carrega os dados para os selects de vínculo
});

closeTeacherButton.addEventListener('click', () => {
    teacherModal.style.display = 'none';
    resetarFormularioProfessor();
});

// Função para carregar e exibir os professores
async function carregarProfessores() {
    teacherListContainer.innerHTML = 'Carregando...';
    try {
        const response = await fetch('http://localhost:3005/professor/listar');
        const professores = await response.json();

        teacherListContainer.innerHTML = ''; // Limpa a lista
        professores.forEach(prof => {
            const div = document.createElement('div');
            div.className = 'class-item';
            // Note que passamos userId para editar/excluir e os outros dados para preencher o form
            div.innerHTML = `
                <span class="class-name">${prof.name} - <strong>${prof.specialization}</strong></span>
                <div class="class-buttons">
                    <button class="edit-btn" onclick="prepararEdicaoProfessor(${prof.userId}, '${prof.name}', '${prof.email}', '${prof.specialization}')"></button>
                    <button class="delete-btn" onclick="excluirProfessor(${prof.userId})"></button>
                </div>
            `;
            teacherListContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar professores:", error);
        teacherListContainer.innerHTML = 'Erro ao carregar professores.';
    }
}

// Função para preencher o formulário para edição
function prepararEdicaoProfessor(userId, name, email, specialization) {
    teacherFormTitle.textContent = 'Editar Professor';
    document.getElementById('teacherName').value = name;
    document.getElementById('teacherEmail').value = email;
    document.getElementById('teacherSpecialization').value = specialization;
    
    // Desabilita e esconde o campo de senha na edição para não ser alterado acidentalmente
    const passwordInput = document.getElementById('teacherPassword');
    passwordInput.required = false;
    passwordInput.parentElement.style.display = 'none';

    teacherForm.setAttribute('data-editing-id', userId);
    window.scrollTo(0, 0); // Rola para o topo do modal
}

// Função para resetar o formulário
function resetarFormularioProfessor() {
    teacherFormTitle.textContent = 'Cadastrar Novo Professor';
    teacherForm.reset();
    teacherForm.removeAttribute('data-editing-id');
    
    const passwordInput = document.getElementById('teacherPassword');
    passwordInput.required = true;
    passwordInput.parentElement.style.display = 'block';
}

// Evento de SUBMIT do formulário de professor (Cria e Edita)
teacherForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = teacherForm.getAttribute('data-editing-id');
    const url = userId ? `http://localhost:3005/professor/${userId}` : 'http://localhost:3005/professor/cadastrar';
    const method = userId ? 'PUT' : 'POST';

    const body = {
        name: document.getElementById('teacherName').value,
        email: document.getElementById('teacherEmail').value,
        specialization: document.getElementById('teacherSpecialization').value,
    };

    // Só adiciona a senha no corpo da requisição se for um cadastro novo
    if (!userId) {
        body.password = document.getElementById('teacherPassword').value;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            resetarFormularioProfessor();
            carregarProfessores();
            popularDropdownsParaVinculo(); // Atualiza a lista de professores no dropdown também
        }
    } catch (error) {
        console.error("Erro ao salvar professor:", error);
    }
});

// Função para excluir professor
async function excluirProfessor(userId) {
    if (!confirm("Tem certeza que deseja excluir este professor? Isso removerá seu acesso e seus dados.")) return;

    try {
        const response = await fetch(`http://localhost:3005/professor/${userId}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            carregarProfessores();
            popularDropdownsParaVinculo();
        }
    } catch (error) {
        console.error("Erro ao excluir professor:", error);
    }
}


// --- LÓGICA PARA VINCULAR PROFESSOR ---

const linkTeacherForm = document.getElementById('linkTeacherForm');

// Função para popular os dropdowns (selects)
async function popularDropdownsParaVinculo() {
    try {
        // Busca paralela de professores, turmas e matérias
        const [profRes, turmaRes, materiaRes] = await Promise.all([
            fetch('http://localhost:3005/professor/listar'),
            fetch('http://localhost:3005/turma/listar'),
            fetch('http://localhost:3005/disciplina/listar')
        ]);

        const professores = await profRes.json();
        const turmas = await turmaRes.json();
        const materias = await materiaRes.json();

        const profSelect = document.getElementById('selectTeacher');
        const turmaSelect = document.getElementById('selectClass');
        const materiaSelect = document.getElementById('selectSubject');

        // Limpa e popula o select de professores
        profSelect.innerHTML = '<option value="">Selecione um professor</option>';
        professores.forEach(p => {
            profSelect.innerHTML += `<option value="${p.teacherId}">${p.name}</option>`;
        });

        // Limpa e popula o select de turmas
        turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        turmas.forEach(t => {
            turmaSelect.innerHTML += `<option value="${t.id}">${t.name} - ${t.grade}</option>`;
        });
        
        // Limpa e popula o select de matérias
        materiaSelect.innerHTML = '<option value="">Selecione uma matéria</option>';
        materias.forEach(m => {
            materiaSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
        });

    } catch (error) {
        console.error('Erro ao popular dropdowns:', error);
    }
}

// Evento de SUBMIT do formulário de vínculo
linkTeacherForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const body = {
        teacherId: document.getElementById('selectTeacher').value,
        classId: document.getElementById('selectClass').value,
        subjectId: document.getElementById('selectSubject').value,
        academicYear: document.getElementById('academicYear').value,
    };

    try {
        const response = await fetch('http://localhost:3005/professor/vincular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        alert(result.message);
        if(response.ok) {
            linkTeacherForm.reset();
        }
    } catch (error) {
        console.error("Erro ao vincular professor:", error);
    }
});

// aluno

const openStudentModalCard = document.getElementById('openStudentModalCard');
const studentModal = document.getElementById('studentModal');
const closeStudentButton = document.querySelector('.close-student-button');
const studentForm = document.getElementById('studentForm');
const studentFormTitle = document.getElementById('studentFormTitle');
const studentListContainer = document.getElementById('studentList');
const studentClassSelect = document.getElementById('studentClass');

// Abrir e fechar o modal de alunos
openStudentModalCard.addEventListener('click', () => {
    studentModal.style.display = 'block';
    carregarAlunos();
    popularDropdownTurmasParaAlunos();
});

closeStudentButton.addEventListener('click', () => {
    studentModal.style.display = 'none';
    resetarFormularioAluno();
});

// Função para popular o dropdown de turmas no formulário de alunos
async function popularDropdownTurmasParaAlunos() {
    try {
        const response = await fetch('http://localhost:3005/turma/listar');
        const turmas = await response.json();

        studentClassSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        turmas.forEach(turma => {
            studentClassSelect.innerHTML += `<option value="${turma.id}">${turma.name} - ${turma.grade}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar turmas para o dropdown:', error);
    }
}

// Função para carregar e exibir os alunos
async function carregarAlunos() {
    studentListContainer.innerHTML = 'Carregando...';
    try {
        const response = await fetch('http://localhost:3005/aluno/listar');
        const alunos = await response.json();

        studentListContainer.innerHTML = '';
        alunos.forEach(aluno => {
            const div = document.createElement('div');
            div.className = 'class-item';
            // A turma pode ser nula (null) se o aluno não estiver alocado
            const turmaInfo = aluno.className ? `${aluno.className} - ${aluno.classGrade}` : 'Sem turma';

            div.innerHTML = `
                <span class="class-name">${aluno.name} (Mat: ${aluno.enrollment}) - <strong>${turmaInfo}</strong></span>
                <div class="class-buttons">
                    <button class="edit-btn" onclick="prepararEdicaoAluno(${aluno.userId}, '${aluno.name}', '${aluno.email}', '${aluno.enrollment}', ${aluno.classId})"></button>
                    <button class="delete-btn" onclick="excluirAluno(${aluno.userId})"></button>
                </div>
            `;
            studentListContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        studentListContainer.innerHTML = 'Erro ao carregar alunos.';
    }
}

// Função para preencher o formulário para edição
function prepararEdicaoAluno(userId, name, email, enrollment, classId) {
    studentFormTitle.textContent = 'Editar Aluno';
    document.getElementById('studentName').value = name;
    document.getElementById('studentEmail').value = email;
    document.getElementById('studentEnrollment').value = enrollment;
    document.getElementById('studentClass').value = classId;

    // Oculta o campo de senha durante a edição
    const passwordInput = document.getElementById('studentPassword');
    passwordInput.required = false;
    passwordInput.parentElement.style.display = 'none';

    studentForm.setAttribute('data-editing-id', userId);
    window.scrollTo(0, 0); // Rola para o topo do modal
}

// Função para resetar o formulário
function resetarFormularioAluno() {
    studentFormTitle.textContent = 'Cadastrar Novo Aluno';
    studentForm.reset();
    studentForm.removeAttribute('data-editing-id');

    const passwordInput = document.getElementById('studentPassword');
    passwordInput.required = true;
    passwordInput.parentElement.style.display = 'block';
}

// Evento de SUBMIT do formulário de aluno (Cria e Edita)
studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = studentForm.getAttribute('data-editing-id');
    const url = userId ? `http://localhost:3005/aluno/${userId}` : 'http://localhost:3005/aluno/cadastrar';
    const method = userId ? 'PUT' : 'POST';

    const body = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        enrollment: document.getElementById('studentEnrollment').value,
        classId: document.getElementById('studentClass').value
    };

    if (!userId) {
        body.password = document.getElementById('studentPassword').value;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            resetarFormularioAluno();
            carregarAlunos();
        }
    } catch (error) {
        console.error("Erro ao salvar aluno:", error);
    }
});

// Função para excluir aluno
async function excluirAluno(userId) {
    if (!confirm("Tem certeza que deseja excluir este aluno? Todos os seus dados serão removidos.")) return;

    try {
        const response = await fetch(`http://localhost:3005/aluno/${userId}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            carregarAlunos();
        }
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
    }
}












// Prof 

// professor_frontend.js - Código completo e corrigido
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portal do Professor carregado');
    
    // --- ELEMENTOS DO MODAL ---
    const modal = document.getElementById('class-modal');
    const modalTitle = document.getElementById('class-modal-title');
    const studentListContainer = document.getElementById('student-list-container');
    const closeModalButton = document.getElementById('close-modal-button');

    // Verifica se os elementos existem
    if (!modal) {
        console.error('Modal não encontrado no DOM');
        return;
    }

    if (!modalTitle) console.warn('modalTitle não encontrado');
    if (!studentListContainer) console.warn('studentListContainer não encontrado');
    if (!closeModalButton) console.warn('closeModalButton não encontrado');

    // ID do professor logado
    const TEACHER_USER_ID = getTeacherID();

    /**
     * Carrega as turmas do professor
     */
    async function loadTeacherClasses() {
        const container = document.getElementById('teacher-class-cards-container');
        if (!container) {
            console.error('Container de turmas não encontrado');
            return;
        }

        try {
            console.log('Buscando turmas para o professor:', TEACHER_USER_ID);
            const response = await fetch(`http://localhost:3000/api/professor/turmas/${TEACHER_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const classes = await response.json();
            console.log('Turmas recebidas:', classes);
            renderClassCards(classes, container);

        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            container.innerHTML = '<p class="error">Erro ao carregar turmas. Verifique o console.</p>';
        }
    }

    /**
     * Renderiza os cards das turmas
     */
    function renderClassCards(classes, container) {
        container.innerHTML = '';

        if (!classes || classes.length === 0) {
            container.innerHTML = '<p>Você não está alocado em nenhuma turma.</p>';
            return;
        }

        classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card';
            card.innerHTML = `
                <h3>${cls.class_name} (${cls.grade})</h3>
                <p><strong>Matéria:</strong> ${cls.subject_name}</p>
                <p><strong>Turno:</strong> ${cls.shift}</p>
                <p><strong>Ano Letivo:</strong> ${cls.academic_year || '2024'}</p>
                <small>Clique para ver alunos</small>
            `;
            
            card.addEventListener('click', () => {
                openStudentModal(cls.class_id, cls.subject_id, cls.teacher_id, cls.class_name, cls.subject_name);
            });

            container.appendChild(card);
        });
    }

    /**
     * Abre o modal e carrega alunos da turma
     */
    async function openStudentModal(classId, subjectId, teacherId, className, subjectName) {
        if (modalTitle) {
            modalTitle.textContent = `Turma: ${className} - ${subjectName}`;
        }
        
        if (studentListContainer) {
            studentListContainer.innerHTML = '<p>Carregando alunos...</p>';
        }
        
        modal.style.display = 'block';

        try {
            const today = new Date().toISOString().split('T')[0];
            const url = `http://localhost:3000/api/turma/${classId}/alunos?subjectId=${subjectId}&teacherId=${teacherId}&date=${today}`;
            
            console.log('Buscando alunos:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const students = await response.json();
            console.log('Alunos recebidos:', students);
            renderStudentTable(students, classId, subjectId, teacherId);

        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            if (studentListContainer) {
                studentListContainer.innerHTML = '<p class="error">Erro ao carregar alunos.</p>';
            }
        }
    }

    /**
     * Renderiza a tabela de alunos
     */
    function renderStudentTable(students, classId, subjectId, teacherId) {
        if (!studentListContainer) return;

        if (!students || students.length === 0) {
            studentListContainer.innerHTML = '<p>Nenhum aluno encontrado nesta turma.</p>';
            return;
        }

        let tableHtml = `
            <table class="student-table">
                <thead>
                    <tr>
                        <th>Aluno</th>
                        <th>Nota (0-10)</th>
                        <th>Presente (Hoje)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach(student => {
            tableHtml += `
                <tr data-student-id="${student.student_id}">
                    <td>${student.name || 'N/A'}</td>
                    <td>
                        <input 
                            type="number" 
                            class="grade-input" 
                            min="0" 
                            max="10" 
                            step="0.1" 
                            value="${student.grade || ''}" 
                            placeholder="0.0"
                        >
                    </td>
                    <td>
                        <input 
                            type="checkbox" 
                            class="attendance-check" 
                            ${student.present === 1 ? 'checked' : ''}
                        >
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
            <div style="margin-top: 20px;">
                <button id="save-data-btn" class="save-button">
                    <i class="fa-solid fa-floppy-disk"></i> Salvar Dados
                </button>
                <button id="close-modal-btn" style="margin-left: 10px; padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;

        studentListContainer.innerHTML = tableHtml;

        // Adiciona eventos
        const saveBtn = document.getElementById('save-data-btn');
        const closeBtn = document.getElementById('close-modal-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                saveAllData(classId, subjectId, teacherId);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    /**
     * Salva notas e presenças
     */
    async function saveAllData(classId, subjectId, teacherId) {
        const rows = document.querySelectorAll('#student-list-container tbody tr');
        const submissions = [];
        const today = new Date().toISOString().split('T')[0];

        // Validação
        let hasErrors = false;
        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const gradeInput = row.querySelector('.grade-input');
            const grade = gradeInput.value;
            const present = row.querySelector('.attendance-check').checked;

            if (grade && (grade < 0 || grade > 10)) {
                gradeInput.style.borderColor = 'red';
                hasErrors = true;
            } else {
                gradeInput.style.borderColor = '';
            }

            submissions.push({
                studentId: parseInt(studentId),
                grade: grade ? parseFloat(grade) : null,
                present: present
            });
        });

        if (hasErrors) {
            alert('Por favor, verifique as notas. Elas devem estar entre 0 e 10.');
            return;
        }

        console.log('Enviando dados:', submissions);

        try {
            const saveBtn = document.getElementById('save-data-btn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                saveBtn.disabled = true;
            }

            const response = await fetch('http://localhost:3000/api/lancar-dados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    classId,
                    subjectId,
                    teacherId,
                    date: today,
                    submissions
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Falha ao salvar dados.');
            }

            alert('Dados salvos com sucesso!');
            modal.style.display = 'none';

        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            alert(`Erro: ${error.message}`);
            
            const saveBtn = document.getElementById('save-data-btn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Dados';
                saveBtn.disabled = false;
            }
        }
    }

    // --- EVENT LISTENERS ---
    
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // --- INICIALIZAÇÃO ---
    loadTeacherClasses();
});


function getTeacherID() {
    // Tenta pegar do localStorage
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('Usuário do localStorage:', user);
            return user.id || 1;
        }
    } catch (e) {
        console.warn('Erro ao ler localStorage:', e);
    }
    
    // Fallback para desenvolvimento
    console.log('Usando ID fallback para desenvolvimento: 1');
    return 1;
}

/**
 * Função de logout
 */
function logout(event) {
    if (event) event.preventDefault();
    
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    }
}

//  aluno 

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portal do Aluno carregado');
    
    // ID do aluno logado
    const STUDENT_USER_ID = getStudentID();
    let studentData = {};

    /**
     * Carrega todos os dados do aluno
     */
    async function loadStudentData() {
        try {
            console.log('Carregando dados do aluno:', STUDENT_USER_ID);
            
            // Carrega informações básicas do aluno
            const studentInfo = await fetchStudentInfo();
            if (!studentInfo) return;

            studentData = studentInfo;

            // Atualiza a interface
            renderClassInfo(studentInfo);
            await loadGrades();
            await loadAttendance();

        } catch (error) {
            console.error('Erro ao carregar dados do aluno:', error);
            showError('Erro ao carregar dados. Tente novamente.');
        }
    }

    /**
     * Busca informações básicas do aluno
     */
    async function fetchStudentInfo() {
        try {
            const response = await fetch(`http://localhost:3000/api/aluno/info/${STUDENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Informações do aluno:', data);
            return data;

        } catch (error) {
            console.error('Erro ao buscar informações do aluno:', error);
            document.getElementById('class-info-content').innerHTML = 
                '<p class="error">Erro ao carregar informações da turma.</p>';
            return null;
        }
    }

    /**
     * Renderiza informações da turma
     */
    function renderClassInfo(studentInfo) {
        const container = document.getElementById('class-info-content');
        
        if (!studentInfo || !studentInfo.class) {
            container.innerHTML = '<p class="no-data">Nenhuma informação de turma disponível.</p>';
            return;
        }

        const classInfo = studentInfo.class;
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div>
                    <strong>Turma:</strong> ${classInfo.class_name}<br>
                    <strong>Série:</strong> ${classInfo.grade}<br>
                    <strong>Turno:</strong> ${classInfo.shift}
                </div>
                <div>
                    <strong>Ano Letivo:</strong> 2024<br>
                    <strong>Capacidade:</strong> ${classInfo.capacity} alunos<br>
                    <strong>Matrícula:</strong> ${studentInfo.enrollment_number}
                </div>
            </div>
            <div style="margin-top: 15px;">
                <strong>Professores e Matérias:</strong>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    ${classInfo.subjects ? classInfo.subjects.map(subject => 
                        `<li>${subject.subject_name} - Prof. ${subject.teacher_name}</li>`
                    ).join('') : '<li>Carregando...</li>'}
                </ul>
            </div>
        `;
    }

    /**
     * Carrega as notas do aluno
     */
    async function loadGrades() {
        try {
            const response = await fetch(`http://localhost:3000/api/aluno/notas/${STUDENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const grades = await response.json();
            console.log('Notas recebidas:', grades);
            renderGrades(grades);

        } catch (error) {
            console.error('Erro ao carregar notas:', error);
            document.getElementById('grades-content').innerHTML = 
                '<p class="error">Erro ao carregar notas.</p>';
        }
    }

    /**
     * Renderiza as notas na tabela
     */
    function renderGrades(grades) {
        const container = document.getElementById('grades-content');
        
        if (!grades || grades.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma nota disponível no momento.</p>';
            return;
        }

        let tableHtml = `
            <table class="subject-list">
                <thead>
                    <tr>
                        <th>Matéria</th>
                        <th>Professor</th>
                        <th>Nota 1º Sem.</th>
                        <th>Nota 2º Sem.</th>
                        <th>Média Final</th>
                        <th>Situação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        grades.forEach(grade => {
            const finalGrade = calculateFinalGrade(grade);
            const situation = getSituation(finalGrade);
            const gradeClass = getGradeClass(finalGrade);

            tableHtml += `
                <tr>
                    <td>${grade.subject_name}</td>
                    <td>${grade.teacher_name}</td>
                    <td class="grade ${getGradeClass(grade.semester1_grade)}">${formatGrade(grade.semester1_grade)}</td>
                    <td class="grade ${getGradeClass(grade.semester2_grade)}">${formatGrade(grade.semester2_grade)}</td>
                    <td class="grade ${gradeClass}">${formatGrade(finalGrade)}</td>
                    <td><span class="grade ${gradeClass}">${situation}</span></td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
            
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-value">${calculateOverallAverage(grades).toFixed(1)}</div>
                    <div class="stat-label">Média Geral</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${countApproved(grades)}</div>
                    <div class="stat-label">Matérias Aprovadas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${grades.length}</div>
                    <div class="stat-label">Total de Matérias</div>
                </div>
            </div>
        `;

        container.innerHTML = tableHtml;
    }

    /**
     * Carrega o histórico de presenças
     */
    async function loadAttendance() {
        try {
            const response = await fetch(`http://localhost:3000/api/aluno/presencas/${STUDENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const attendance = await response.json();
            console.log('Presenças recebidas:', attendance);
            renderAttendance(attendance);

        } catch (error) {
            console.error('Erro ao carregar presenças:', error);
            document.getElementById('attendance-content').innerHTML = 
                '<p class="error">Erro ao carregar histórico de presenças.</p>';
        }
    }

    /**
     * Renderiza o histórico de presenças
     */
    function renderAttendance(attendance) {
        const container = document.getElementById('attendance-content');
        
        if (!attendance || attendance.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum registro de presença disponível.</p>';
            return;
        }

        // Agrupar presenças por matéria
        const attendanceBySubject = groupAttendanceBySubject(attendance);

        let html = '';
        
        Object.keys(attendanceBySubject).forEach(subjectName => {
            const subjectData = attendanceBySubject[subjectName];
            const stats = calculateAttendanceStats(subjectData.records);

            html += `
                <div style="margin-bottom: 25px;">
                    <h4 style="margin-bottom: 10px; color: #2c3e50;">
                        <i class="fa-solid fa-book"></i> ${subjectName}
                    </h4>
                    
                    <div class="stats-container" style="margin-bottom: 15px;">
                        <div class="stat-card">
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">Total de Aulas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.present}</div>
                            <div class="stat-label">Presenças</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.absent}</div>
                            <div class="stat-label">Faltas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.percentage}%</div>
                            <div class="stat-label">Frequência</div>
                        </div>
                    </div>

                    <div style="overflow-x: auto;">
                        <table class="attendance-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Status</th>
                                    <th>Turma</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subjectData.records.map(record => `
                                    <tr>
                                        <td>${formatDate(record.date)}</td>
                                        <td class="${record.present ? 'present' : 'absent'}">
                                            ${record.present ? 'Presente' : 'Falta'}
                                        </td>
                                        <td>${record.class_name}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Funções auxiliares para cálculos
     */
    function calculateFinalGrade(grade) {
        if (grade.semester1_grade && grade.semester2_grade) {
            return (parseFloat(grade.semester1_grade) + parseFloat(grade.semester2_grade)) / 2;
        }
        return grade.semester1_grade || grade.semester2_grade || 0;
    }

    function getSituation(grade) {
        if (grade >= 7) return 'Aprovado';
        if (grade >= 5) return 'Recuperação';
        return 'Reprovado';
    }

    function getGradeClass(grade) {
        if (!grade) return '';
        if (grade >= 7) return 'grade-high';
        if (grade >= 5) return 'grade-medium';
        return 'grade-low';
    }

    function formatGrade(grade) {
        return grade ? grade.toFixed(1) : '-';
    }

    function calculateOverallAverage(grades) {
        const validGrades = grades.filter(grade => 
            grade.semester1_grade || grade.semester2_grade
        );
        
        if (validGrades.length === 0) return 0;
        
        const sum = validGrades.reduce((total, grade) => {
            return total + calculateFinalGrade(grade);
        }, 0);
        
        return sum / validGrades.length;
    }

    function countApproved(grades) {
        return grades.filter(grade => {
            const finalGrade = calculateFinalGrade(grade);
            return finalGrade >= 7;
        }).length;
    }

    function groupAttendanceBySubject(attendance) {
        const grouped = {};
        
        attendance.forEach(record => {
            if (!grouped[record.subject_name]) {
                grouped[record.subject_name] = {
                    records: [],
                    teacher: record.teacher_name
                };
            }
            grouped[record.subject_name].records.push(record);
        });

        // Ordenar registros por data
        Object.keys(grouped).forEach(subject => {
            grouped[subject].records.sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        return grouped;
    }

    function calculateAttendanceStats(records) {
        const total = records.length;
        const present = records.filter(r => r.present).length;
        const absent = total - present;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { total, present, absent, percentage };
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    function showError(message) {
        // Poderia usar um toast ou modal aqui
        console.error('Erro:', message);
        alert(message);
    }

    // Menu navigation
    document.querySelectorAll('#side_items .side-item a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('#side_items .side-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // Aqui você pode implementar a navegação entre seções
            const menuId = this.id;
            console.log('Menu clicado:', menuId);
            
            // Exemplo de navegação simples
            if (menuId === 'menu-dashboard') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Inicialização
    loadStudentData();
});

/**
 * Obtém o ID do aluno logado
 */
function getStudentID() {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('Aluno do localStorage:', user);
            
            // Verifica se o perfil é aluno
            if (user.profile !== 'aluno') {
                console.warn('Usuário não é aluno, redirecionando...');
                window.location.href = '../login.html';
                return null;
            }
            
            return user.id || 2; // Fallback para ID 2 (primeiro aluno)
        }
    } catch (e) {
        console.warn('Erro ao ler localStorage:', e);
    }
    
    // Fallback para desenvolvimento
    console.log('Usando ID fallback para aluno: 2');
    return 2;
}

/**
 * Função de logout
 */
function logout(event) {
    if (event) event.preventDefault();
    
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    }
}