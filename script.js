document.addEventListener('DOMContentLoaded', () => {
    // Configuração do PDF.js
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // Elementos da UI
    const elementos = {
        texto: document.getElementById('texto'),
        falarBtn: document.getElementById('falar'),
        pausarBtn: document.getElementById('pausar'),
        continuarBtn: document.getElementById('continuar'),
        cancelarBtn: document.getElementById('cancelar'),
        vozesSelect: document.getElementById('vozes'),
        taxaInput: document.getElementById('taxa'),
        taxaValor: document.getElementById('taxa-valor'),
        tomInput: document.getElementById('tom'),
        tomValor: document.getElementById('tom-valor'),
        volumeInput: document.getElementById('volume'),
        volumeValor: document.getElementById('volume-valor'),
        temaToggle: document.getElementById('tema-toggle'),
        pdfUpload: document.getElementById('pdf-upload'),
        pdfPreview: document.getElementById('pdf-preview'),
        uploadLabel: document.querySelector('.upload-label'),
        anoAtual: document.getElementById('ano-atual')
    };

    // Verificar suporte à API de Voz
    if (!window.speechSynthesis) {
        mostrarAlerta('Seu navegador não suporta a Web Speech API. Por favor, use Chrome, Firefox ou Edge atualizados.');
        desativarBotoes();
    }

    // Inicialização
    const synth = window.speechSynthesis;
    let utterance = null;
    elementos.anoAtual.textContent = new Date().getFullYear();

    // Atualizar valores dos controles
    elementos.taxaInput.addEventListener('input', atualizarValor.bind(null, 'taxa'));
    elementos.tomInput.addEventListener('input', atualizarValor.bind(null, 'tom'));
    elementos.volumeInput.addEventListener('input', atualizarValor.bind(null, 'volume'));

    function atualizarValor(tipo) {
        elementos[`${tipo}Valor`].textContent = elementos[`${tipo}Input`].value;
    }

    // Carregar vozes disponíveis
    function carregarVozes() {
        elementos.vozesSelect.innerHTML = '';
        const vozes = synth.getVoices();
        
        // Filtrar e ordenar vozes
        const vozesPtBR = vozes.filter(voz => voz.lang === 'pt-BR');
        const vozesPt = vozes.filter(voz => voz.lang.includes('pt') && !voz.lang.includes('pt-BR'));
        const outrasVozes = vozes.filter(voz => !voz.lang.includes('pt'));
        const vozesOrdenadas = [...vozesPtBR, ...vozesPt, ...outrasVozes];

        if (vozesOrdenadas.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Nenhuma voz encontrada';
            elementos.vozesSelect.appendChild(option);
            return;
        }

        vozesOrdenadas.forEach(voz => {
            const option = document.createElement('option');
            option.textContent = `${voz.name} (${voz.lang})`;
            option.setAttribute('data-lang', voz.lang);
            option.setAttribute('data-name', voz.name);
            elementos.vozesSelect.appendChild(option);
        });
    }

    // Configurar eventos de voz
    synth.onvoiceschanged = carregarVozes;
    if (synth.getVoices().length > 0) carregarVozes();

    // Controles de fala
    elementos.falarBtn.addEventListener('click', falarTexto);
    elementos.pausarBtn.addEventListener('click', pausarFala);
    elementos.continuarBtn.addEventListener('click', continuarFala);
    elementos.cancelarBtn.addEventListener('click', cancelarFala);

    function falarTexto() {
        if (elementos.texto.value.trim() === '') {
            mostrarAlerta('Por favor, digite algum texto ou carregue um PDF.');
            return;
        }

        if (synth.speaking) synth.cancel();

        utterance = new SpeechSynthesisUtterance(elementos.texto.value);
        configurarVoz();
        configurarEventosFala();
        synth.speak(utterance);
    }

    function configurarVoz() {
        const vozSelecionada = elementos.vozesSelect.selectedOptions[0]?.getAttribute('data-name');
        if (vozSelecionada) {
            const voz = synth.getVoices().find(v => v.name === vozSelecionada);
            if (voz) utterance.voice = voz;
        }

        utterance.rate = parseFloat(elementos.taxaInput.value);
        utterance.pitch = parseFloat(elementos.tomInput.value);
        utterance.volume = parseFloat(elementos.volumeInput.value);
    }

    function configurarEventosFala() {
        elementos.falarBtn.disabled = true;
        elementos.pausarBtn.disabled = false;
        
        utterance.onstart = () => {
            elementos.falarBtn.setAttribute('aria-busy', 'true');
        };
        
        utterance.onend = () => {
            resetarControlesFala();
        };
        
        utterance.onerror = (e) => {
            console.error('Erro na fala:', e);
            mostrarAlerta('Ocorreu um erro ao reproduzir o áudio');
            resetarControlesFala();
        };
    }

    function pausarFala() {
        if (synth.speaking) {
            synth.pause();
            elementos.pausarBtn.disabled = true;
            elementos.continuarBtn.disabled = false;
        }
    }

    function continuarFala() {
        if (synth.paused) {
            synth.resume();
            elementos.pausarBtn.disabled = false;
            elementos.continuarBtn.disabled = true;
        }
    }

    function cancelarFala() {
        synth.cancel();
        resetarControlesFala();
    }

    function resetarControlesFala() {
        elementos.falarBtn.disabled = false;
        elementos.pausarBtn.disabled = true;
        elementos.continuarBtn.disabled = true;
        elementos.falarBtn.removeAttribute('aria-busy');
    }

    // Upload e leitura de PDF
    configurarDragAndDrop();

    async function configurarDragAndDrop() {
        elementos.uploadLabel.addEventListener('dragover', handleDragOver);
        elementos.uploadLabel.addEventListener('dragleave', handleDragLeave);
        elementos.uploadLabel.addEventListener('drop', handleDrop);
        elementos.pdfUpload.addEventListener('change', handleFileSelect);
    }

    function handleDragOver(e) {
        e.preventDefault();
        elementos.uploadLabel.style.borderColor = 'var(--cor-primaria)';
        elementos.uploadLabel.style.backgroundColor = 'var(--cor-upload-hover)';
    }

    function handleDragLeave() {
        resetarEstilosUpload();
    }

    function handleDrop(e) {
        e.preventDefault();
        resetarEstilosUpload();
        if (e.dataTransfer.files[0]) {
            elementos.pdfUpload.files = e.dataTransfer.files;
            handlePDFUpload(e.dataTransfer.files[0]);
        }
    }

    function handleFileSelect(e) {
        if (e.target.files[0]) handlePDFUpload(e.target.files[0]);
    }

    function resetarEstilosUpload() {
        elementos.uploadLabel.style.borderColor = '';
        elementos.uploadLabel.style.backgroundColor = '';
    }

    async function handlePDFUpload(file) {
        if (file.type !== 'application/pdf') {
            mostrarAlerta('Por favor, selecione um arquivo PDF.');
            return;
        }

        elementos.pdfPreview.innerHTML = '<p class="loading">Carregando PDF...</p>';
        elementos.texto.disabled = true;
        elementos.texto.placeholder = 'Processando PDF...';
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = await extrairTextoPDF(pdf);
            
            exibirPreviewPDF(file.name, fullText);
            elementos.texto.value = fullText;
        } catch (error) {
            console.error('Erro ao processar PDF:', error);
            elementos.pdfPreview.innerHTML = '<p class="error">Erro ao carregar o PDF. Certifique-se de que é um arquivo válido.</p>';
        } finally {
            elementos.texto.disabled = false;
            elementos.texto.placeholder = 'Digite seu texto aqui ou carregue um PDF...';
        }
    }

    async function extrairTextoPDF(pdf) {
        let fullText = '';
        const pageLimit = Math.min(pdf.numPages, 10);
        const pageDigits = pageLimit.toString().length;
        
        for (let i = 1; i <= pageLimit; i++) {
            try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                
                // Adiciona número da página formatado (Página 01, 02, etc.)
                const pageNum = i.toString().padStart(pageDigits, '0');
                fullText += `\n\nPágina ${pageNum}:\n${pageText}`;
                
                // Atualiza preview progressivamente
                if (i % 3 === 0 || i === pageLimit) {
                    exibirPreviewPDFProgressivo(fullText);
                }
            } catch (error) {
                console.error(`Erro na página ${i}:`, error);
                fullText += `\n\n[Erro ao processar página ${i}]`;
            }
        }
        
        return fullText.trim();
    }

    function exibirPreviewPDFProgressivo(texto) {
        const previewText = texto.substring(0, 500) + (texto.length > 500 ? '...' : '');
        elementos.pdfPreview.querySelector('.loading').textContent = `Processando... ${previewText}`;
    }

    function exibirPreviewPDF(nomeArquivo, texto) {
        const previewText = texto.substring(0, 500) + (texto.length > 500 ? '...' : '');
        elementos.pdfPreview.innerHTML = `
            <h3>${nomeArquivo}</h3>
            <p>${previewText}</p>
            <small>${Math.ceil(texto.length / 1000)}k caracteres extraídos</small>
        `;
    }

    // Controle de tema
    elementos.temaToggle.addEventListener('click', alternarTema);

    function alternarTema() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        elementos.temaToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('tema', isDark ? 'dark' : 'light');
    }

    // Verificar tema preferido
    function verificarTemaPreferido() {
        const temaSalvo = localStorage.getItem('tema');
        const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (temaSalvo === 'dark' || (!temaSalvo && prefereDark)) {
            document.body.classList.add('dark');
            elementos.temaToggle.textContent = '🌙';
        }
    }

    // Monitorar mudanças no tema do sistema
    function monitorarTemaSistema() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('tema')) {
                document.body.classList.toggle('dark', e.matches);
                elementos.temaToggle.textContent = e.matches ? '🌙' : '☀️';
            }
        });
    }

    // Funções auxiliares
    function mostrarAlerta(mensagem) {
        const alerta = document.createElement('div');
        alerta.className = 'alerta';
        alerta.textContent = mensagem;
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.classList.add('fade-out');
            setTimeout(() => alerta.remove(), 300);
        }, 3000);
    }

    function desativarBotoes() {
        elementos.falarBtn.disabled = true;
        elementos.pausarBtn.disabled = true;
        elementos.continuarBtn.disabled = true;
        elementos.cancelarBtn.disabled = true;
    }

    // Inicializar
    verificarTemaPreferido();
    monitorarTemaSistema();
});
