const express = require("express");
const cors = require("cors");
const connection = require('./db_config'); 
const path = require('path');

const port = 3005;

const app = express();

app.use(cors());
app.use(express.json());

app.listen(port, () => console.log(`Rodando porta ${port}`));

// Login

app.post('/login', (request, response) => {
    const email = request.body.email;
    const pass = request.body.pass;

    if (!email || !pass) {
        return response.status(400).json({
            success: false,
            message: "Campos de email e senha são obrigatórios.",
        });
    }

    // --- CORREÇÃO AQUI ---
    // Alterado de 'perfil' para 'profile' para corresponder ao seu banco de dados.
    let query = "SELECT id, name, email, password, profile FROM users WHERE email = ?";
    let params = [email]; 

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Erro ao consultar o banco de dados:", err);
            return response.status(500).json({
                success: false,
                message: "Erro no servidor.",
            });
        }

        if (results.length > 0) {
            const senhaDigitada = pass;
            const senhaBanco = results[0].password;

            if (senhaBanco === senhaDigitada) {
                
                // Remove a senha antes de enviar
                const { password, ...userData } = results[0]; 

                return response.status(200).json({
                    success: true,
                    message: "Login realizado com sucesso!",
                    data: userData, // Agora 'userData' contém 'profile'
                });
            } else {
                return response.status(400).json({
                    success: false,
                    message: "Credenciais inválidas.",
                });
            }
        } else {
            return response.status(400).json({
                success: false,
                message: "Credenciais inválidas.",
            });
        }
    });
});


// Modal do pedagogo  /  card

// app.post('/turmas/cadastrar', async (request, response) => {
//     // 1. Pega os dados enviados pelo front-end no corpo (body) da requisição
//     const { nome, descricao } = request.body; 

//     // Validação simples para ver se o nome da turma foi enviado
//     if (!nome) {
//         return response.status(400).json({
//             success: false,
//             message: "O nome da turma é obrigatório."
//         });
//     }

//     // 2. AQUI ESTÁ A QUERY que você perguntou!
//     // Ela insere os dados na tabela 'turmas' que criamos.
//     let query = "INSERT INTO turmas(nome, descricao) VALUES (?, ?)";

//     // 3. Executa a query no banco de dados, passando os dados de forma segura
//     // O 'connection' é a sua variável de conexão com o MySQL
//     connection.query(query, [nome, descricao], (err, results) => {
//         if (err) {
//             // Se der erro no banco, retorna uma resposta de erro
//             return response.status(500).json({
//                 success: false,
//                 message: "Erro ao cadastrar a turma no banco de dados.",
//                 error: err
//             });
//         }
        
//         // Se der tudo certo, retorna uma resposta de sucesso
//         response.status(201).json({
//             success: true,
//             message: "Turma cadastrada com sucesso!",
//             data: results
//         });
//     });
// });

//Cadastro da Turma

app.post('/turma/cadastrar', async (request, response) => {
    const { className, classGrade, shift, capacity } = request.body; 

    // Query para inserir os dados
    let query = "INSERT INTO classes (name, grade, shift, capacity) VALUES (?, ?, ?, ?)";

    // Executar a query no banco de dados
    connection.query(query, [className, classGrade, shift, capacity], (err, results) => {
        if (err) {
            return response.status(400).json({
                success: false,
                message: "Erro ao cadastrar turma",
                error: err
            });
        }
        response.status(201).json({
            success: true,
            message: "Turma cadastrada com sucesso",
            data: results
        });
    });
});

// Listagem da turma

// app.get('/turmas', (request, response) => {
//     // Query SQL para selecionar todas as turmas. 
//     // Selecionamos colunas específicas e ordenamos por nome para uma melhor organização.
//     const query = "SELECT id, name, grade, shift FROM classes ORDER BY name ASC";

//     connection.query(query, (err, results) => {
//         if (err) {
//             // Se houver um erro no banco, retorna um erro 500 (Internal Server Error)
//             return response.status(500).json({
//                 success: false,
//                 message: "Erro ao buscar as turmas no banco de dados.",
//                 error: err
//             });
//         }

//         // Se a busca for bem-sucedida, retorna os resultados com status 200 (OK)
//         response.status(200).json({
//             success: true,
//             data: results // 'results' será um array de objetos, onde cada objeto é uma turma
//         });
//     });
// });

// Listagem das turmas
app.get('/turma/listar', (req, res) => {
  // Selecione o 'id' junto com os outros campos.
  connection.query("SELECT id, name, grade, shift, capacity FROM classes", (err, results) => {
    if (err) return res.status(500).json({ message: "Erro ao buscar turmas", error: err });
    res.status(200).json(results);
  });
});

// Excluir turma (Seu código já está correto, desde que o frontend envie o 'id' certo)
app.delete('/turma/:id', (req, res) => {
  const { id } = req.params;
  connection.query("DELETE FROM classes WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro ao excluir turma", error: err });
    if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Turma não encontrada" });
    }
    res.status(200).json({ message: "Turma excluída com sucesso" });
  });
});

// Atualizar turma - CORRIJA OS NOMES DAS COLUNAS AQUI!
app.put('/turma/:id', (req, res) => {
  const { id } = req.params;
  // Use os mesmos nomes que você usa para cadastrar: name, grade, etc.
  const { name, grade, shift, capacity } = req.body; 
  connection.query(
    // ATENÇÃO: Corrija os nomes das colunas para bater com seu banco de dados (ex: name, grade)
    "UPDATE classes SET name = ?, grade = ?, shift = ?, capacity = ? WHERE id = ?",
    [name, grade, shift, capacity, id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erro ao atualizar turma", error: err });
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Turma não encontrada" });
      }
      res.status(200).json({ message: "Turma atualizada com sucesso" });
    }
  );
});

// --- ROTAS PARA PROFESSORES ---

// CADASTRAR PROFESSOR (com transação)
app.post('/professor/cadastrar', (req, res) => {
    const { name, email, password, specialization } = req.body;

    // 

    connection.beginTransaction(err => {
        if (err) { return res.status(500).json({ message: "Erro ao iniciar transação.", error: err }); }

        // 1. Insere na tabela 'users'
        const userQuery = "INSERT INTO users (name, email, password, profile) VALUES (?, ?, ?, 'professor')";
        connection.query(userQuery, [name, email, password], (err, userResult) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).json({ message: "Erro ao cadastrar usuário do professor.", error: err });
                });
            }

            const newUserId = userResult.insertId;

            // 2. Insere na tabela 'teachers'
            const teacherQuery = "INSERT INTO teachers (user_id, specialization) VALUES (?, ?)";
            connection.query(teacherQuery, [newUserId, specialization], (err, teacherResult) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ message: "Erro ao cadastrar dados do professor.", error: err });
                    });
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ message: "Erro ao confirmar cadastro.", error: err });
                        });
                    }
                    res.status(201).json({ message: "Professor cadastrado com sucesso!" });
                });
            });
        });
    });
});


// LISTAR PROFESSORES
app.get('/professor/listar', (req, res) => {
    const query = `
        SELECT 
            u.id as userId, 
            u.name, 
            u.email, 
            t.id as teacherId, 
            t.specialization 
        FROM users u 
        JOIN teachers t ON u.id = t.user_id 
        WHERE u.profile = 'professor'`;
        
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar professores", error: err });
        res.status(200).json(results);
    });
});

// ATUALIZAR PROFESSOR (precisa atualizar as duas tabelas)
app.put('/professor/:userId', (req, res) => {
    const { userId } = req.params;
    const { name, email, specialization } = req.body;

    connection.beginTransaction(err => {
        if (err) { return res.status(500).json({ message: "Erro ao iniciar transação.", error: err }); }

        const userQuery = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        connection.query(userQuery, [name, email, userId], (err, userResult) => {
            if (err) {
                return connection.rollback(() => res.status(500).json({ message: "Erro ao atualizar usuário.", error: err }));
            }

            const teacherQuery = "UPDATE teachers SET specialization = ? WHERE user_id = ?";
            connection.query(teacherQuery, [specialization, userId], (err, teacherResult) => {
                if (err) {
                    return connection.rollback(() => res.status(500).json({ message: "Erro ao atualizar dados do professor.", error: err }));
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() => res.status(500).json({ message: "Erro ao confirmar atualização.", error: err }));
                    }
                    res.status(200).json({ message: "Professor atualizado com sucesso!" });
                });
            });
        });
    });
});

// EXCLUIR PROFESSOR
// Graças ao "ON DELETE CASCADE" no seu DB, só precisamos deletar o usuário.
app.delete('/professor/:userId', (req, res) => {
    const { userId } = req.params;
    const query = "DELETE FROM users WHERE id = ?";
    
    connection.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao excluir professor", error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Professor não encontrado" });
        res.status(200).json({ message: "Professor excluído com sucesso" });
    });
});


// --- ROTAS PARA VÍNCULOS E DADOS AUXILIARES ---

// ROTA PARA LISTAR MATÉRIAS (para o dropdown)
app.get('/disciplina/listar', (req, res) => {
    connection.query("SELECT id, name FROM subjects", (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar matérias", error: err });
        res.status(200).json(results);
    });
});


// ROTA PARA VINCULAR PROFESSOR-TURMA-MATÉRIA
app.post('/professor/vincular', (req, res) => {
    const { teacherId, classId, subjectId, academicYear } = req.body;
    const query = "INSERT INTO teacher_class_subject (teacher_id, class_id, subject_id, academic_year) VALUES (?, ?, ?, ?)";

    connection.query(query, [teacherId, classId, subjectId, academicYear], (err, results) => {
        if (err) {
            // Código '1062' é para entrada duplicada (UNIQUE KEY)
            if (err.errno === 1062) {
                return res.status(409).json({ message: "Este professor já está vinculado a esta turma/matéria neste ano." });
            }
            return res.status(500).json({ message: "Erro ao vincular professor.", error: err });
        }
        res.status(201).json({ message: "Professor vinculado com sucesso!" });
    });
});

// 

// CADASTRAR ALUNO (com transação)
app.post('/aluno/cadastrar', (req, res) => {
    const { name, email, password, enrollment, classId } = req.body;

    // Lembre-se da segurança da senha (usar bcrypt em produção)

    connection.beginTransaction(err => {
        if (err) { return res.status(500).json({ message: "Erro ao iniciar transação.", error: err }); }

        // 1. Insere na tabela 'users'
        const userQuery = "INSERT INTO users (name, email, password, profile) VALUES (?, ?, ?, 'aluno')";
        connection.query(userQuery, [name, email, password], (err, userResult) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).json({ message: "Erro ao cadastrar usuário do aluno.", error: err });
                });
            }

            const newUserId = userResult.insertId;

            // 2. Insere na tabela 'students'
            const studentQuery = "INSERT INTO students (user_id, enrollment_number, class_id) VALUES (?, ?, ?)";
            connection.query(studentQuery, [newUserId, enrollment, classId], (err, studentResult) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ message: "Erro ao cadastrar dados do aluno.", error: err });
                    });
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ message: "Erro ao confirmar cadastro.", error: err });
                        });
                    }
                    res.status(201).json({ message: "Aluno cadastrado com sucesso!" });
                });
            });
        });
    });
});


// LISTAR ALUNOS
app.get('/aluno/listar', (req, res) => {
    const query = `
        SELECT 
            u.id AS userId,
            u.name,
            u.email,
            s.id AS studentId,
            s.enrollment_number AS enrollment,
            s.class_id AS classId,
            c.name AS className,
            c.grade AS classGrade
        FROM users u
        JOIN students s ON u.id = s.user_id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE u.profile = 'aluno'`;
        
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar alunos.", error: err });
        res.status(200).json(results);
    });
});

// ATUALIZAR ALUNO
app.put('/aluno/:userId', (req, res) => {
    const { userId } = req.params;
    const { name, email, enrollment, classId } = req.body;

    connection.beginTransaction(err => {
        if (err) { return res.status(500).json({ message: "Erro ao iniciar transação.", error: err }); }

        // 1. Atualiza a tabela 'users'
        const userQuery = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        connection.query(userQuery, [name, email, userId], (err, userResult) => {
            if (err) {
                return connection.rollback(() => res.status(500).json({ message: "Erro ao atualizar usuário.", error: err }));
            }

            // 2. Atualiza a tabela 'students'
            const studentQuery = "UPDATE students SET enrollment_number = ?, class_id = ? WHERE user_id = ?";
            connection.query(studentQuery, [enrollment, classId, userId], (err, studentResult) => {
                if (err) {
                    return connection.rollback(() => res.status(500).json({ message: "Erro ao atualizar dados do aluno.", error: err }));
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() => res.status(500).json({ message: "Erro ao confirmar atualização.", error: err }));
                    }
                    res.status(200).json({ message: "Aluno atualizado com sucesso!" });
                });
            });
        });
    });
});


// EXCLUIR ALUNO
// O 'ON DELETE CASCADE' cuidará de remover o registro da tabela 'students' automaticamente.
app.delete('/aluno/:userId', (req, res) => {
    const { userId } = req.params;
    const query = "DELETE FROM users WHERE id = ?";
    
    connection.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao excluir aluno.", error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Aluno não encontrado." });
        res.status(200).json({ message: "Aluno excluído com sucesso." });
    });
});

// Prof rotas 

app.get('/api/professor/turmas/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Buscando turmas para usuário: ${userId}`);

    try {
        // 1. Encontrar o teacher_id a partir do user_id
        const [teacherRows] = await pool.execute(
            'SELECT id FROM teachers WHERE user_id = ?', 
            [userId]
        );
        
        if (teacherRows.length === 0) {
            console.log('Professor não encontrado para user_id:', userId);
            return res.status(404).json({ error: 'Professor não encontrado.' });
        }
        
        const teacherId = teacherRows[0].id;
        console.log('Teacher ID encontrado:', teacherId);

        // 2. Buscar as turmas e matérias
        const sql = `
            SELECT 
                t.id AS teacher_id, 
                c.id AS class_id, 
                c.name AS class_name, 
                c.grade, 
                c.shift, 
                s.id AS subject_id, 
                s.name AS subject_name,
                tcs.academic_year
            FROM teacher_class_subject tcs
            JOIN classes c ON tcs.class_id = c.id
            JOIN subjects s ON tcs.subject_id = s.id
            JOIN teachers t ON tcs.teacher_id = t.id
            WHERE tcs.teacher_id = ?
            ORDER BY c.name, s.name;
        `;

        const [classes] = await pool.execute(sql, [teacherId]);
        console.log(`Encontradas ${classes.length} turmas`);
        
        res.json(classes);

    } catch (error) {
        console.error('Erro na rota /api/professor/turmas:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

/**
 * ROTA 2: Buscar alunos de uma turma
 */
app.get('/api/turma/:classId/alunos', async (req, res) => {
    const { classId } = req.params;
    const { subjectId, teacherId, date } = req.query;

    console.log(`Buscando alunos da turma ${classId}, matéria ${subjectId}, data ${date}`);

    if (!subjectId || !teacherId || !date) {
        return res.status(400).json({ 
            error: 'Parâmetros faltando: subjectId, teacherId e date são obrigatórios.' 
        });
    }

    try {
        const sql = `
            SELECT 
                s.id AS student_id, 
                u.name,
                u.email,
                (SELECT g.grade 
                 FROM grades g 
                 WHERE g.student_id = s.id 
                   AND g.subject_id = ? 
                   AND g.teacher_id = ?) AS grade,
                   
                (SELECT a.present 
                 FROM attendance a 
                 WHERE a.student_id = s.id 
                   AND a.subject_id = ? 
                   AND a.date = ?) AS present
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.class_id = ?
            ORDER BY u.name;
        `;
        
        const params = [subjectId, teacherId, subjectId, date, classId];
        const [students] = await pool.execute(sql, params);
        
        console.log(`Encontrados ${students.length} alunos`);
        res.json(students);

    } catch (error) {
        console.error('Erro na rota /api/turma/:classId/alunos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


app.post('/api/lancar-dados', async (req, res) => {
    const { classId, subjectId, teacherId, date, submissions } = req.body;

    console.log('Recebendo dados para salvar:', {
        classId, subjectId, teacherId, date,
        totalSubmissions: submissions.length
    });

    if (!submissions || submissions.length === 0) {
        return res.status(400).json({ error: 'Nenhum dado de aluno recebido.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        
        const academic_year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;
        const semester = (month <= 6) ? '1' : '2';

        console.log(`Ano letivo: ${academic_year}, Semestre: ${semester}`);

        
        for (const sub of submissions) {
            const { studentId, grade, present } = sub;
            console.log(`Processando aluno ${studentId}: nota=${grade}, presente=${present}`);

           
            const attendanceSql = `
                INSERT INTO attendance (student_id, class_id, subject_id, date, present)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE present = VALUES(present);
            `;
            const presentValue = present ? 1 : 0;
            await connection.execute(attendanceSql, [
                studentId, classId, subjectId, date, presentValue
            ]);

            
            if (grade !== null && grade !== '') {
                const gradeSql = `
                    INSERT INTO grades (student_id, subject_id, teacher_id, grade, semester, academic_year)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        grade = VALUES(grade),
                        updated_at = CURRENT_TIMESTAMP;
                `;
                await connection.execute(gradeSql, [
                    studentId, subjectId, teacherId, grade, semester, academic_year
                ]);
            }
        }

        await connection.commit();
        console.log('Dados salvos com sucesso!');
        res.json({ message: 'Dados salvos com sucesso!' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro na rota /api/lancar-dados:', error);
        res.status(500).json({ error: 'Erro ao salvar dados no banco.' });
    } finally {
        if (connection) connection.release();
    }
});

//aluno

app.get('/api/aluno/info/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Buscando informações do aluno: ${userId}`);

    try {
        // 1. Buscar informações básicas do aluno
        const [studentRows] = await pool.execute(`
            SELECT 
                s.id as student_id,
                s.enrollment_number,
                s.class_id,
                u.name as student_name,
                u.email,
                c.name as class_name,
                c.grade,
                c.shift,
                c.capacity
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN classes c ON s.class_id = c.id
            WHERE s.user_id = ?
        `, [userId]);

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }

        const studentInfo = studentRows[0];
        const classId = studentInfo.class_id;

        // 2. Buscar professores e matérias da turma
        const [subjectsRows] = await pool.execute(`
            SELECT 
                s.name as subject_name,
                s.id as subject_id,
                u.name as teacher_name,
                tcs.academic_year
            FROM teacher_class_subject tcs
            JOIN subjects s ON tcs.subject_id = s.id
            JOIN teachers t ON tcs.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE tcs.class_id = ?
            ORDER BY s.name
        `, [classId]);

        studentInfo.subjects = subjectsRows;

        res.json({
            ...studentInfo,
            class: {
                class_name: studentInfo.class_name,
                grade: studentInfo.grade,
                shift: studentInfo.shift,
                capacity: studentInfo.capacity,
                subjects: subjectsRows
            }
        });

    } catch (error) {
        console.error('Erro na rota /api/aluno/info:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

/**
 * ROTA 6: Buscar notas do aluno
 */
app.get('/api/aluno/notas/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Buscando notas do aluno: ${userId}`);

    try {
        // 1. Encontrar o student_id
        const [studentRows] = await pool.execute(
            'SELECT id FROM students WHERE user_id = ?', 
            [userId]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }

        const studentId = studentRows[0].id;

        // 2. Buscar notas agrupadas por matéria
        const sql = `
            SELECT 
                s.name as subject_name,
                su.name as teacher_name,
                MAX(CASE WHEN g.semester = '1' THEN g.grade END) as semester1_grade,
                MAX(CASE WHEN g.semester = '2' THEN g.grade END) as semester2_grade,
                g.academic_year
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            JOIN teachers t ON g.teacher_id = t.id
            JOIN users su ON t.user_id = su.id
            WHERE g.student_id = ?
            GROUP BY s.name, su.name, g.academic_year
            ORDER BY s.name
        `;

        const [grades] = await pool.execute(sql, [studentId]);
        res.json(grades);

    } catch (error) {
        console.error('Erro na rota /api/aluno/notas:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

/**
 * ROTA 7: Buscar histórico de presenças
 */
app.get('/api/aluno/presencas/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Buscando presenças do aluno: ${userId}`);

    try {
        // 1. Encontrar o student_id
        const [studentRows] = await pool.execute(
            'SELECT id FROM students WHERE user_id = ?', 
            [userId]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }

        const studentId = studentRows[0].id;

        // 2. Buscar presenças
        const sql = `
            SELECT 
                a.date,
                a.present,
                s.name as subject_name,
                c.name as class_name,
                u.name as teacher_name
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            JOIN classes c ON a.class_id = c.id
            JOIN teachers t ON a.subject_id = s.id
            JOIN users u ON t.user_id = u.id
            WHERE a.student_id = ?
            ORDER BY a.date DESC, s.name
            LIMIT 50
        `;

        const [attendance] = await pool.execute(sql, [studentId]);
        res.json(attendance);

    } catch (error) {
        console.error('Erro na rota /api/aluno/presencas:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});