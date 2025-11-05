            import inquirer from 'inquirer'
            import chalk from 'chalk'
            import fs from 'fs'

            // Inicia o programa
            menuPrincipal()

            function menuPrincipal() {
                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'acao',
                            message: 'O que você deseja fazer?',
                            choices: [
                                'Criar conta',
                                'Consultar saldo',
                                'Depositar',
                                'Sacar',
                                'Transferir',
                                'Sair'
                            ]
                        },
                    ])
                    .then((resposta) => {
                        const acao = resposta.acao

                        if (acao === 'Criar conta') {
                            criarConta()
                        } else if (acao === 'Consultar saldo') {
                            consultarSaldo()
                        } else if (acao === 'Depositar') {
                            realizarDeposito()
                        } else if (acao === 'Sacar') {
                            realizarSaque()
                        } else if (acao === 'Transferir') {
                            transferencia()
                        } 
                        
                        else if (acao === 'Sair') {
                            console.log(chalk.bgGreen.black('Obrigado(a) por usar o Banco Terminal!'))
                            process.exit()
                        }
                    })
                    .catch((erro) => console.log(erro))
            }

            function criarConta() {
                console.log(chalk.bgGreen.black('Bem-vindo(a)!'))
                console.log(chalk.bgGreen('Vamos criar sua nova conta abaixo.'))
                solicitarNomeConta()
            }

            function solicitarNomeConta() {
                inquirer
                    .prompt([
                        {
                            name: 'nomeConta',
                            message: 'Digite o nome que deseja para sua conta:'
                        }
                    ])
                    .then((resposta) => {
                        const { nomeConta } = resposta

                        if (!fs.existsSync('contas')) {
                            fs.mkdirSync('contas')
                        }

                        if (fs.existsSync(`contas/${nomeConta}.json`)) {
                            console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome!'))
                            solicitarNomeConta()
                            return
                        }

                        fs.writeFileSync(`contas/${nomeConta}.json`, '{ "saldo": 0 }', (erro) => {
                            console.log(erro)
                        })

                        console.log(chalk.bgGreen.black('Parabéns! Sua conta foi criada com sucesso!'))
                        menuPrincipal()
                    })
                    .catch((erro) => console.log(erro))
            }

            function realizarDeposito() {
                inquirer
                    .prompt([
                        {
                            name: 'nomeConta',
                            message: 'Qual é o nome da sua conta?'
                        }
                    ])
                    .then((resposta) => {
                        const nomeConta = resposta.nomeConta

                        if (!verificarContaExiste(nomeConta)) {
                            return realizarDeposito()
                        }

                        inquirer
                            .prompt([
                                {
                                    name: 'valor',
                                    message: 'Digite o valor que você deseja depositar:'
                                }
                            ])
                            .then((resposta) => {
                                const valor = resposta.valor
                                adicionarSaldo(nomeConta, valor)
                                menuPrincipal()
                            })
                            .catch((erro) => console.log(erro))
                    })
                    .catch((erro) => console.log(erro))
            }

            function verificarContaExiste(nomeConta) {
                if (!fs.existsSync(`contas/${nomeConta}.json`)) {
                    // console.log(chalk.bgRed.black('Essa conta não existe. Tente novamente...'))
                    return chalk.bgRed.black('Essa conta não existe. Tente novamente...')
                }
                return true
            }

            function adicionarSaldo(nomeConta, valor) {
                const dadosConta = obterDadosConta(nomeConta)

                if (!valor) {
                    console.log(chalk.bgRed.black('Valor inválido. Tente novamente.'))
                    return realizarDeposito()
                }

                dadosConta.saldo = parseFloat(dadosConta.saldo) + parseFloat(valor)

                fs.writeFileSync(
                    `contas/${nomeConta}.json`,
                    JSON.stringify(dadosConta),
                    (erro) => console.log(erro)
                )

                console.log(chalk.bgGreen.black(`Foi depositado o valor de R$${valor} na sua conta.`))
            }

            function obterDadosConta(nomeConta) {
                const dadosJson = fs.readFileSync(`contas/${nomeConta}.json`, {
                    encoding: 'utf-8',
                    flag: 'r'
                })
                return JSON.parse(dadosJson)
            }

            function consultarSaldo() {
                inquirer
                    .prompt([
                        {
                            name: 'nomeConta',
                            message: 'Digite o nome da conta que deseja consultar o saldo:'
                        }
                    ])
                    .then((resposta) => {
                        const nomeConta = resposta.nomeConta

                        if (!verificarContaExiste(nomeConta)) {
                            return consultarSaldo()
                        }

                        const dadosConta = obterDadosConta(nomeConta)

                        console.log(chalk.bgBlue.black(`O saldo da sua conta é R$${dadosConta.saldo}`))
                        menuPrincipal()
                    })
                    .catch((erro) => console.log(erro))
            }

            function realizarSaque() {
                inquirer
                    .prompt([
                        {
                            name: 'nomeConta',
                            message: 'Qual é o nome da sua conta?'
                        }
                    ])
                    .then((resposta) => {
                        const nomeConta = resposta.nomeConta

                        if (!verificarContaExiste(nomeConta)) {
                            return realizarSaque()
                        }

                        inquirer
                            .prompt([
                                {
                                    name: 'valor',
                                    message: 'Quanto você deseja sacar?'
                                }
                            ])
                            .then((resposta) => {
                                const valor = resposta.valor
                                removerSaldo(nomeConta, valor)
                            })
                            .catch((erro) => console.log(erro))
                    })
                    .catch((erro) => console.log(erro))
            }

            function removerSaldo(nomeConta, valor) {
                const dadosConta = obterDadosConta(nomeConta)

                if (!valor) {
                    console.log(chalk.bgRed.black('Valor inválido. Tente novamente.'))
                    return realizarSaque()
                }

                if (dadosConta.saldo < valor) {
                    console.log(chalk.bgRed.black('Saldo insuficiente!'))
                    return realizarSaque()
                }

                dadosConta.saldo = parseFloat(dadosConta.saldo) - parseFloat(valor)

                fs.writeFileSync(`contas/${nomeConta}.json`, JSON.stringify(dadosConta), (erro) => {
                    console.log(erro)
                })

                console.log(chalk.bgGreen.black(`Foi sacado o valor de R$${valor} da sua conta.`))
                menuPrincipal()
            }

            function transferencia(){
                inquirer.prompt([
                    {
                        name: 'nomeConta',
                        message: 'Digite o nome da sua conta:',
                        validate: verificarContaExiste
                    },

                    {
                        name: 'contaDestino',
                        message: 'Digite o o nome da conta que você irá realizar a transferencia:',
                        validate: verificarContaExiste
                    },
                    {
                        name: 'valor',
                        message: 'Qual valor você deseja transferir?',
                    
                    }
                ]).then((resposta)=>{
                    let { nomeConta,valor,contaDestino } = resposta
                    const dadosConta = obterDadosConta(nomeConta)
                    const dadosDestino = obterDadosConta(contaDestino)

                
                    if(valor > dadosConta.saldo){
                        console.log('Valor do saldo é menor do que o valor da transferencia')
                    }
                    else{
                        const novoSaldo = dadosConta.saldo - valor // 100 - 50 = 50
                        console.log(chalk.bgGreen.black(`Transferência no valor de ${novoSaldo} realizada com sucesso!`))
                        
                        dadosConta.saldo = novoSaldo
                        dadosDestino.saldo += parseFloat(valor)
                        fs.writeFileSync(`contas/${nomeConta}.json`, JSON.stringify(dadosConta, null, 2))
                        fs.writeFileSync(`contas/${contaDestino}.json`, JSON.stringify(dadosDestino, null, 2))

                    }
                

                })
                .catch((error)=>{
                    console.log(error)
                })
            }

            
