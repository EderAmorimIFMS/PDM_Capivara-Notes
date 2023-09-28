import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('anotacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);
    document.getElementById('btnBuscar').addEventListener('click', buscarUmaAnotacao);
    document.getElementById('btnAlterar').addEventListener('click', alterarAnotacao);
    document.getElementById('btnExcluir').addEventListener('click', excluirAnotacao);
    document.getElementById("limparCampos").addEventListener('click', limparCampos);
});

async function buscarTodasAnotacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
 
    const tx = await db.transaction('anotacao', 'readonly')
    const store = tx.objectStore('anotacao');

    const anotacoes = await store.getAll();

    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return `<div class="item">
                    <p>Anotação</p>
                    <p>${anotacao.titulo} - ${anotacao.data} </p>
                    <p>${anotacao.categoria}</p>
                    <p>${anotacao.descricao}</p>
                   </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function adicionarAnotacao() {
    let titulo = document.getElementById("titulo").value;
    let categoria = document.getElementById("categoria").value;
    let data = document.getElementById("data").value;
    let descricao = document.getElementById("descricao").value;

    const tx = await db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');

    try {
        await store.add({ 
            titulo: titulo, 
            categoria: categoria, 
            data: data, 
            descricao: descricao
        });
        await tx.done;
        limparCampos();
        alert('Registro adicionado com sucesso!');
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar:', error);
        tx.abort();
    }
}

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("categoria").value = '';
    document.getElementById("data").value = '';
    document.getElementById("descricao").value = '';
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}

async function buscarUmaAnotacao(){
    let buscar = document.getElementById("buscar").value;

    const tx = await db.transaction('anotacao', 'readonly');
    const store = tx.objectStore('anotacao');

    try{
        const anotacao = await store.get(buscar);
        document.getElementById("titulo").value = anotacao.titulo;
        document.getElementById("categoria").value = anotacao.categoria;
        document.getElementById("data").value = anotacao.data;
        document.getElementById("descricao").value = anotacao.descricao;
        document.getElementById("buscar").value = '';
        
    }catch(error){ 
        console.error('Erro na busca:', error);
    }
}

async function alterarAnotacao(){
    let titulo = document.getElementById("titulo").value;
    let categoria = document.getElementById("categoria").value;
    let data = document.getElementById("data").value;
    let descricao = document.getElementById("descricao").value;

    const tx = await db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');

    try {
        const anotacao = await store.get(titulo);

        if(!anotacao){
            alert('Anotaçao em questão não encontrada.');
            console.log('Não tem a anotação cadastrada.');
        } else {
            anotacao.categoria = categoria;
            anotacao.data = data;
            anotacao.descricao = descricao;
        } 

        await store.put(anotacao);
        
        await tx.done;
        limparCampos();
        alert('Alterado com sucesso!');
        console.log('Alterado com sucesso!');
    } catch (error) {
        console.error('Erro ao alterar:', error);
        tx.abort();
    }
}


async function excluirAnotacao(){
    let titulo = document.getElementById("titulo").value;

    const tx = await db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');
    
    try {
        const anotacao = await store.get(titulo);

        if(!anotacao){
            alert('Anotaçao em questão não encontrada.');
            console.log('Não tem a anotação cadastrada.');
        } else {
            await store.delete(titulo);
            await tx.done;
            limparCampos();

        } 
        
        console.log('Deletado com sucesso!');
        alert('Deletado com sucesso!');
    } catch (error) {
        console.error('Erro ao deletar:', error);
        tx.abort();
    }
}