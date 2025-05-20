document.addEventListener('DOMContentLoaded', () => {
    // Elementos da UI
    const texto = document.getElementById('texto');
    const falarBtn = document.getElementById('falar');
    const pausarBtn = document.getElementById('pausar');
    const continuarBtn = document.getElementById('continuar');
    const cancelarBtn = document.getElementById('cancelar');
    const vozesSelect = document.getElementById('vozes');
    const taxaInput = document.getElementById('taxa');
    const taxaValor = document.getElementById('taxa-valor');
    const tomInput = document.getElementById('tom');
    const tomValor = document.getElementById('tom-valor');
    const volumeInput = document.getElementById('volume');
    const volumeValor = document.getElementById('volume-valor');
    const temaToggle = document.getElementById('tema-toggle');
    
    // Verificar suporte à API
    if (!window.speechSynthesis) {
        alert('Seu navegador não suporta a Web Speech API. Por favor, use Chrome, Firefox ou Edge atualizados.');
        falarBtn.disabled = true;
        pausarBtn.disabled = true;
        continuarBtn.disabled = true;
        cancelarBtn.disabled = true;
        return;
    }
    
    let synth = window.speechSynthesis;
    let utterance = null;
    
    // Atualizar valores dos controles deslizantes
    taxaInput.addEventListener('input', () => {
        taxaValor.textContent = taxaInput.value;
    });
    
    tomInput.addEventListener('input', () => {
        tomValor.textContent = tomInput.value;
    });
    
    volumeInput.addEventListener('input', () => {
        volumeValor.textContent = volumeInput.value;
    });
    
    // Carregar vozes disponíveis
    function carregarVozes() {
        vozesSelect.innerHTML = '';
        
        const vozes = synth.getVoices();
        
        // Filtrar vozes em português (priorizando português do Brasil)
        const vozesPtBR = vozes.filter(voz => voz.lang === 'pt-BR');
        const vozesPt = vozes.filter(voz => voz.lang.includes('pt') && !voz.lang.includes('pt-BR'));
        const outrasVozes = vozes.filter(voz => !voz.lang.includes('pt'));
        
        const vozesOrdenadas = [...vozesPtBR, ...vozesPt, ...outrasVozes];
        
        if (vozesOrdenadas.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Nenhuma voz encontrada';
            vozesSelect.appendChild(option);
            return;
        }
        
        vozesOrdenadas.forEach(voz => {
            const option = document.createElement('option');
            option.textContent = `${voz.name} (${voz.lang})`;
            option.setAttribute('data-lang', voz.lang);
            option.setAttribute('data-name', voz.name);
            vozesSelect.appendChild(option);
        });
    }
    
    // Alguns navegadores precisam deste evento para carregar as vozes
    synth.onvoiceschanged = carregarVozes;
    
    // Se as vozes já estiverem carregadas
    if (synth.getVoices().length > 0) {
        carregarVozes();
    }
    
    // Iniciar a fala
    falarBtn.addEventListener('click', () => {
        if (texto.value.trim() === '') {
            alert('Por favor, digite algum texto.');
            return;
        }
        
        if (synth.speaking) {
            synth.cancel();
        }
        
        utterance = new SpeechSynthesisUtterance(texto.value);
        
        // Configurar voz selecionada
        const vozSelecionada = vozesSelect.selectedOptions[0]?.getAttribute('data-name');
        if (vozSelecionada) {
            const vozes = synth.getVoices();
            const voz = vozes.find(v => v.name === vozSelecionada);
            if (voz) utterance.voice = voz;
        }
        
        // Configurar parâmetros de fala
        utterance.rate = parseFloat(taxaInput.value);
        utterance.pitch = parseFloat(tomInput.value);
        utterance.volume = parseFloat(volumeInput.value);
        
        // Eventos
        utterance.onstart = () => {
            console.log('Fala iniciada');
            falarBtn.disabled = true;
        };
        
        utterance.onend = () => {
            console.log('Fala concluída');
            falarBtn.disabled = false;
        };
        
        utterance.onerror = (event) => {
            console.error('Erro na fala:', event.error);
            falarBtn.disabled = false;
        };
        
        synth.speak(utterance);
    });
    
    // Controles de reprodução
    pausarBtn.addEventListener('click', () => {
        if (synth.speaking) {
            synth.pause();
        }
    });
    
    continuarBtn.addEventListener('click', () => {
        if (synth.paused) {
            synth.resume();
        }
    });
    
    cancelarBtn.addEventListener('click', () => {
        synth.cancel();
        falarBtn.disabled = false;
    });
    
    // Controle de tema dark/light
    temaToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        
        if (document.body.classList.contains('dark')) {
            temaToggle.textContent = 'Modo Claro';
            localStorage.setItem('tema', 'dark');
        } else {
            temaToggle.textContent = 'Modo Escuro';
            localStorage.setItem('tema', 'light');
        }
    });
    
    // Verificar preferência salva ou do sistema
    if (localStorage.getItem('tema') === 'dark' || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('tema'))) {
        document.body.classList.add('dark');
        temaToggle.textContent = 'Modo Claro';
    }
    
    // Atualizar tema quando as preferências do sistema mudarem
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('tema')) {
            if (e.matches) {
                document.body.classList.add('dark');
                temaToggle.textContent = 'Modo Claro';
            } else {
                document.body.classList.remove('dark');
                temaToggle.textContent = 'Modo Escuro';
            }
        }
    });
});