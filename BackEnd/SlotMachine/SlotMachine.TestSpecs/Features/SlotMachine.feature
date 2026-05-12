#language: pt-br

@SlotMachineGame
Funcionalidade: Jogar na Slot Machine
    Como um jogador do cassino
    Eu quero girar os rolos da máquina de slots
    Para que eu possa ganhar prêmios baseados nas combinações das 3 linhas

Contexto:
    Dado que eu sou um jogador chamado "Danilo"
    E eu possuo um saldo inicial de 100.00

Cenário: Jogador realiza um giro e ganha em todas as linhas
    Dado que a máquina está configurada para retornar sempre o símbolo "🍒"
    Quando eu clico no botão de girar
    Então o sistema deve debitar 3.00 do meu saldo
    E o meu saldo atualizado deve ser 115.00
    E o resultado deve indicar que eu sou um vencedor com prêmio de 18.00

Cenário: Jogador realiza um giro e não ganha nada
    Dado que a máquina está configurada para retornar símbolos variados sem prêmio
    Quando eu clico no botão de girar
    Então o sistema deve debitar 3.00 do meu saldo
    E o meu saldo atualizado deve ser 97.00
    E o resultado deve indicar que eu não ganhei prêmios

Cenário: Jogador tenta girar sem saldo suficiente
    Dado que eu possuo um saldo inicial de 2.00
    Quando eu clico no botão de girar
    Então o sistema deve impedir o giro
    E exibir a mensagem de erro "Saldo insuficiente para girar."