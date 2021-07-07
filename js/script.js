const  Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active');
    },
    close(){
        //fechar o modal
        //remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),
    
    /*[ 
        {
            description: 'Luz',
            amount: -50000,
            date: '23/01/2021'
        },
        {
            description: 'Website',
            amount: 500000,
            date: '23/01/2021'
        },
        {
            description: 'Internet',
            amount: -20000,
            date: '23/01/2021',
        }, 
        {
            description: 'App',
            amount: 200000,
            date: '23/01/2021',
        },
    ],*/
    // atributo add
    // Transaction é a const
    // All é transactions ou transações
    // Const.transações.empurrar(posição na array)
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        //pegar todas as transações
        //para cada transacao
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0) {
                //somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })
        
        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'), 
    
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `               
        <td class='description'>${transaction.description}</td>
        <td class='celular ${CSSClass}'>${amount}</td>
        <td class='date'>${transaction.date}</td>
        <td>
        <img class="cursor" onclick="Transaction.remove(${index})"src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    },
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100;
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '- ' : ''

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
        
        return signal + value
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,

        }
    },

    validateField() {
        const { description, amount, date } = Form.getValues()
        
        if(description.trim() === "" ||
        amount.trim() === "" ||
        date.trim() === "" ) {
            throw new Error(`Por favor, preencha todos os campos.
            Pressione OK, para continuar`)
        } 
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""    
        Form.date.value = ""    
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateField()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }

        
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance() 

        Storage.set(Transaction.all)
        
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()