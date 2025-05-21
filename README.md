<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitor de Texto e PDF com Voz</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Leitor de Texto e PDF com Voz</h1>
            <button id="tema-toggle" aria-label="Alternar tema">☀️</button>
        </header>
        
        <main>
            <div class="upload-area">
                <label for="pdf-upload" class="upload-label">
                    <span class="upload-icon">📄</span>
                    <span class="upload-text">Arraste um PDF ou clique para selecionar</span>
                    <input type="file" id="pdf-upload" accept=".pdf" />
                </label>
                <div id="pdf-preview" class="pdf-preview"></div>
            </div>
            
            <textarea id="texto" placeholder="Digite seu texto aqui ou carregue um PDF..." aria-label="Área de texto"></textarea>
            
            <div class="controls">
                <select id="vozes" aria-label="Selecionar voz"></select>
                
                <div class="range-controls">
                    <div class="range-control">
                        <label for="taxa">Velocidade</label>
                        <input type="range" id="taxa" min="0.5" max="2" step="0.1" value="1" aria-label="Velocidade de fala">
                        <span id="taxa-valor">1</span>
                    </div>
                    <div class="range-control">
                        <label for="tom">Tom</label>
                        <input type="range" id="tom" min="0.1" max="2" step="0.1" value="1" aria-label="Tom de voz">
                        <span id="tom-valor">1</span>
                    </div>
                    <div class="range-control">
                        <label for="volume">Volume</label>
                        <input type="range" id="volume" min="0" max="1" step="0.1" value="1" aria-label="Volume de saída">
                        <span id="volume-valor">1</span>
                    </div>
                </div>
            </div>
            
            <div class="botoes">
                <button id="falar" class="btn-primary">▶️ Falar</button>
                <button id="pausar" class="btn-secondary">⏸ Pausar</button>
                <button id="continuar" class="btn-secondary">⏯ Continuar</button>
                <button id="cancelar" class="btn-danger">⏹ Cancelar</button>
            </div>
        </main>
    </div>

    <footer>
        <p>Leitor de Texto e PDF &copy; <span id="ano-atual"></span> | Web Speech API + PDF.js</p>
        <p class="compatibilidade">Compatível com Chrome, Edge e Firefox</p>
        <p>Criado por LH</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
