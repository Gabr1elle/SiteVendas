const vm = new Vue({
	el: "#app",
	data: {
		produtos: [],
		produto: false,
		carrinho: [],
		carrinhoAtivo: false,
		mensagemAlerta: "Item adicionado",
		alertaAtivo: false,
	},

	// Filtro - Formatar e transformar dados, ex: converter a moeda.//

	filters: {
		numeroPreco(valor) {
			return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
		}
	},

	// Calcular - Definir propriedades computadas e retorna o valor calculado com base nas propriedades reativas do componente. //
	computed: {
		carrinhoTotal() {
			let total = 0;
			if (this.carrinho.length) {
				this.carrinho.forEach(item => {
					total += item.preco;
				})
			}
			return total;
		}
	},

	// Método - Define metodos de um componente, serve para  manipular dados //
	methods: {		
		fetchProdutos() {
			fetch("./api/produtos.json")
				.then(r => r.json())
				.then(r => {
					this.produtos = r;
				})
		},

		// Manipular os dados pelo ID//
		fetchProduto(id) {
			fetch(`./api/produtos/${id}/dados.json`)
				.then(r => r.json())
				.then(r => {
					this.produto = r;
				})
		},
		
		//Abrir um modal ou janela de exibição com detalhes de um produto específico que é fornecido detalhes pelo ID na função fetchProduto(id)//
		abrirModal(id) {
			this.fetchProduto(id);
			window.scrollTo({
				top: 0,
				behavior: "smooth"
			})
		},

		// Função para fechar o modal, verificar se o clique foi executado dentro do modal comparando os eventos, se for verdadeiro, o produto fica falso e fecha o modal.//
		fecharModal({ target, currentTarget }) {
			if (target === currentTarget) this.produto = false;

		},
		
		// Função para fechar o modal, verificar se o clique foi executado dentro do modal comparando os eventos, se for verdadeiro, o produto fica falso e fecha o modal.//
		clickForaCarrinho({ target, currentTarget }) {
			if (target === currentTarget) this.carrinhoAtivo = false;

		},
		
		// Puxar ID do produto adicionado ao carrinho e exibir o nome com mensagem adicional// 
		adicionarItem() {
			this.produto.estoque--;
			const { id, nome, preco } = this.produto;
			this.carrinho.push({ id, nome, preco });
			this.alerta(`${nome} adicionado ao carrinho.`);
		},

		//Utilizado para remover itens na array "carrinho" e splice é utilizado para remover um item da array a partir do indice (index)//
		//O 2° argumento, no caso 1, indica a quantidade de elementos a serem removidos a partir do índice fornecido.//
		removerItem(index) {
			this.carrinho.splice(index, 1);
		},
		
		// Manter dados persistentes mesmo após o carregamento da pagina //
		checarLocalStorage() {
			if (window.localStorage.carrinho)
				this.carrinho = JSON.parse(window.localStorage.carrinho);
		},

		//Exibir alerta de que algum produto foi adicionado em ate 1500 milisegundos e depois parar de ser exibido //
		alerta(mensagem) {
			this.mensagemAlerta = mensagem;
			this.alertaAtivo = true;
			setTimeout(() => {
				this.alertaAtivo = false;
			}, 1500);
		},

		//Função para verificar a quantidade de itens que tem no carrinho para atualizar os itens do estoque  //
		compararEstoque() {
			const items = this.carrinho.filter(({ id }) => id === this.produto.id);
			this.produto.estoque = this.produto.estoque - items.length;
		},
	},

    // Identificar pela URL qual produto esta mostrando na tela através da # e pelo ID//
	router() {
		const hash = document.location.hash;
		if (hash)
			this.fetchProduto(hash.replace("#", ""));

	},

    // Monitora as alterações na propriedade "produto" executa uma série de ações em resposta a essas alterações///Atualizar a URL exibida no navegador, alterando a parte de hash.//
	watch: {
		produto() {
			document.title = this.produto.nome || "Techno";
			const hash = this.produto.id || "";
			history.pushState(null, null, `#${hash}`);
			if (this.produto) {
				this.compararEstoque(0);

			}
		},
		
		// Convertendo o objeto em uma string JSON e armazenando-o na chave "carrinho" do armazenamento local. Isso permite que os dados do carrinho de compras sejam salvos entre sessões ou atualizações da página. //
		carrinho() {
			window.localStorage.carrinho = JSON.stringify(this.carrinho);
		}
	},

	// iniacilização do métodos// 

	created() {
		this.fetchProdutos();
		this.router();
		this.checarLocalStorage();
	}
})
