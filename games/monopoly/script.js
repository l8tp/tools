// 游戏配置
const TILE_COUNT = 20; // 地块数量

// 游戏状态
let gameState = {
    players: [
        { id: 1, position: 0, money: 1500, name: '玩家1', emoji: '🐱' },
        { id: 2, position: 0, money: 1500, name: '玩家2', emoji: '🐶' }
    ],
    currentPlayer: 0,
    tiles: [],
    gameMessage: '',
    moneyLog: []
};

// 全局变量
let currentBuyingPlayer = null;
let currentBuyingTile = null;

// 地块类型
const TILE_TYPES = {
    START: 'start',
    PROPERTY: 'property',
    CHANCE: 'chance',
    TAX: 'tax',
    JAIL: 'jail',
    FREE_PARKING: 'free-parking'
};

// 城市主题地块数据
const cityTiles = [
    { name: '起点', type: TILE_TYPES.START, price: 0, rent: 0, emoji: '🏁' },
    { name: '市中心', type: TILE_TYPES.PROPERTY, price: 200, rent: 20, emoji: '🏙️' },
    { name: '商业区', type: TILE_TYPES.PROPERTY, price: 180, rent: 18, emoji: '🏬' },
    { name: '公园', type: TILE_TYPES.FREE_PARKING, price: 0, rent: 0, emoji: '🌳' },
    { name: '住宅区', type: TILE_TYPES.PROPERTY, price: 150, rent: 15, emoji: '🏠' },
    { name: '机会', type: TILE_TYPES.CHANCE, price: 0, rent: 0, emoji: '🎁' },
    { name: '工业区', type: TILE_TYPES.PROPERTY, price: 120, rent: 12, emoji: '🏭' },
    { name: '税务', type: TILE_TYPES.TAX, price: 100, rent: 0, emoji: '💰' },
    { name: '学校', type: TILE_TYPES.PROPERTY, price: 160, rent: 16, emoji: '🏫' },
    { name: '医院', type: TILE_TYPES.PROPERTY, price: 170, rent: 17, emoji: '🏥' },
    { name: '监狱', type: TILE_TYPES.JAIL, price: 0, rent: 0, emoji: '🔒' },
    { name: '体育馆', type: TILE_TYPES.PROPERTY, price: 190, rent: 19, emoji: '🏟️' },
    { name: '机会', type: TILE_TYPES.CHANCE, price: 0, rent: 0, emoji: '🎁' },
    { name: '购物中心', type: TILE_TYPES.PROPERTY, price: 220, rent: 22, emoji: '🛍️' },
    { name: '机场', type: TILE_TYPES.PROPERTY, price: 250, rent: 25, emoji: '✈️' },
    { name: '税务', type: TILE_TYPES.TAX, price: 200, rent: 0, emoji: '💰' },
    { name: '酒店', type: TILE_TYPES.PROPERTY, price: 210, rent: 21, emoji: '🏨' },
    { name: '博物馆', type: TILE_TYPES.PROPERTY, price: 140, rent: 14, emoji: '🏛️' },
    { name: '机会', type: TILE_TYPES.CHANCE, price: 0, rent: 0, emoji: '🎁' },
    { name: '火车站', type: TILE_TYPES.PROPERTY, price: 130, rent: 13, emoji: '🚉' }
];

// 机会卡
const chanceCards = [
    '获得100元',
    '失去50元',
    '前进3格',
    '后退2格',
    '直接到起点',
    '获得50元',
    '失去100元',
    '前进到最近的物业'
];

// 初始化游戏
function initGame() {
    // 生成地块
    gameState.tiles = cityTiles;
    
    // 渲染玩家标记
    renderPlayerMarkers();
    
    // 更新玩家资金显示
    updatePlayerMoney();
    
    // 更新游戏信息
    updateGameMessage(`游戏开始！${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 请掷骰子`);
}

// 更新地块所有者显示
function updateTileOwners() {
    gameState.tiles.forEach((tile, index) => {
        const tileElement = document.querySelector(`.tile:nth-child(${index + 2})`);
        if (tileElement) {
            const ownerElement = tileElement.querySelector('.tile-owner');
            if (ownerElement) {
                const owner = gameState.players.find(player => tile.owner === player.id);
                if (owner) {
                    ownerElement.textContent = `${owner.emoji} ${owner.name}`;
                    ownerElement.style.display = 'block';
                } else {
                    ownerElement.style.display = 'none';
                }
            }
        }
    });
}

// 渲染玩家标记
function renderPlayerMarkers() {
    // 清除现有标记
    document.querySelectorAll('.player-marker').forEach(marker => marker.remove());
    
    // 添加玩家标记
    gameState.players.forEach(player => {
        const tile = document.querySelector(`.tile:nth-child(${player.position + 2})`);
        if (tile) {
            const marker = document.createElement('div');
            marker.className = `player-marker player${player.id}`;
            marker.innerHTML = player.emoji;
            tile.appendChild(marker);
        }
    });
}

// 掷骰子
function rollDice() {
    const dice = Math.floor(Math.random() * 6) + 1;
    document.getElementById('diceResult').textContent = dice;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    updateGameMessage(`${currentPlayer.emoji} ${currentPlayer.name} 掷出了 ${dice} 点`);
    
    // 移动玩家
    setTimeout(() => {
        movePlayer(currentPlayer, dice);
    }, 1000);
}

// 移动玩家
function movePlayer(player, steps) {
    // 动画移动
    let currentStep = 0;
    const originalPosition = player.position;
    
    const moveInterval = setInterval(() => {
        currentStep++;
        player.position = (originalPosition + currentStep) % TILE_COUNT;
        renderPlayerMarkers();
        
        if (currentStep >= steps) {
            clearInterval(moveInterval);
            // 处理地块效果
            setTimeout(() => {
                handleTileEffect(player, player.position);
            }, 500);
        }
    }, 200);
}

// 处理地块效果
function handleTileEffect(player, position) {
    const tile = gameState.tiles[position];
    
    switch (tile.type) {
        case TILE_TYPES.START:
            player.money += 200;
            updateGameMessage(`${player.emoji} ${player.name} 经过起点，获得 200 元`);
            addMoneyLog(`${player.emoji} 获得 200 元（起点）`);
            
            // 更新玩家资金显示
            updatePlayerMoney();
            
            // 切换玩家
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
            }, 1500);
            break;
        
        case TILE_TYPES.PROPERTY:
            if (!tile.owner) {
                // 地块未被购买
                if (player.money >= tile.price) {
                    // 显示购买弹窗
                    showBuyModal(player, tile);
                } else {
                    updateGameMessage(`${player.name} 资金不足，无法购买 ${tile.name}`);
                    // 继续游戏流程
                    setTimeout(() => {
                        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                        updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
                    }, 1500);
                }
            } else if (tile.owner !== player.id) {
                // 地块属于其他玩家，支付租金
                const owner = gameState.players.find(p => p.id === tile.owner);
                if (owner) {
                    player.money -= tile.rent;
                    owner.money += tile.rent;
                    updateGameMessage(`${player.emoji} ${player.name} 支付 ${owner.emoji} ${owner.name} ${tile.rent} 元租金`);
                    addMoneyLog(`${player.emoji} 支付 ${tile.rent} 元租金给 ${owner.emoji}`);
                    addMoneyLog(`${owner.emoji} 获得 ${tile.rent} 元租金`);
                    
                    // 更新玩家资金显示
                    updatePlayerMoney();
                    
                    // 切换玩家
                    setTimeout(() => {
                        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                        updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
                    }, 1500);
                }
            } else {
                // 地块属于自己
                updateGameMessage(`${player.emoji} ${player.name} 到达自己的 ${tile.name}`);
                
                // 切换玩家
                setTimeout(() => {
                    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                    updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
                }, 1500);
            }
            break;
        
        case TILE_TYPES.CHANCE:
            const chanceCard = chanceCards[Math.floor(Math.random() * chanceCards.length)];
            updateGameMessage(`${player.emoji} ${player.name} 抽到机会卡：${chanceCard}`);
            handleChanceCard(player, chanceCard);
            
            // 切换玩家
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
            }, 1500);
            break;
        
        case TILE_TYPES.TAX:
            player.money -= tile.price;
            updateGameMessage(`${player.emoji} ${player.name} 支付税务：¥${tile.price}`);
            addMoneyLog(`${player.emoji} 支付 ${tile.price} 元税务`);
            
            // 更新玩家资金显示
            updatePlayerMoney();
            
            // 切换玩家
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
            }, 1500);
            break;
        
        case TILE_TYPES.JAIL:
            updateGameMessage(`${player.emoji} ${player.name} 进入监狱`);
            
            // 切换玩家
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
            }, 1500);
            break;
        
        case TILE_TYPES.FREE_PARKING:
            updateGameMessage(`${player.emoji} ${player.name} 停在免费停车区`);
            
            // 切换玩家
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
            }, 1500);
            break;
    }
}

// 添加资金流水日志
function addMoneyLog(message) {
    // 获取当前时间
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    // 添加时间戳
    const logMessage = `[${timeString}] ${message}`;
    gameState.moneyLog.unshift(logMessage);
    // 限制日志数量
    if (gameState.moneyLog.length > 10) {
        gameState.moneyLog.pop();
    }
    // 更新日志显示
    updateMoneyLog();
}

// 更新资金流水日志显示
function updateMoneyLog() {
    const logElement = document.getElementById('moneyLog');
    if (logElement) {
        logElement.innerHTML = gameState.moneyLog.map(log => `<div>${log}</div>`).join('');
    }
}

// 更新玩家资金显示
function updatePlayerMoney() {
    gameState.players.forEach(player => {
        const moneyElement = document.querySelector(`.player.player${player.id} .player-money`);
        if (moneyElement) {
            moneyElement.textContent = `¥${player.money}`;
        }
    });
}

// 显示购买弹窗
function showBuyModal(player, tile) {
    currentBuyingPlayer = player;
    currentBuyingTile = tile;
    
    const modal = document.getElementById('buyModal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.innerHTML = `${player.emoji} ${player.name}，是否购买 ${tile.emoji} ${tile.name}？<br>价格：¥${tile.price}<br>租金：¥${tile.rent}`;
    modal.style.display = 'block';
}

// 隐藏购买弹窗
function hideBuyModal() {
    const modal = document.getElementById('buyModal');
    modal.style.display = 'none';
    currentBuyingPlayer = null;
    currentBuyingTile = null;
}

// 处理购买
function handleBuy() {
    if (currentBuyingPlayer && currentBuyingTile) {
        currentBuyingPlayer.money -= currentBuyingTile.price;
        currentBuyingTile.owner = currentBuyingPlayer.id;
        updateGameMessage(`${currentBuyingPlayer.emoji} ${currentBuyingPlayer.name} 购买了 ${currentBuyingTile.name}，花费 ¥${currentBuyingTile.price}`);
        addMoneyLog(`${currentBuyingPlayer.emoji} 花费 ${currentBuyingTile.price} 元购买 ${currentBuyingTile.name}`);
        
        // 更新玩家资金显示
        updatePlayerMoney();
        
        // 更新地块所有者显示
        updateTileOwners();
        
        // 重新渲染玩家标记
        renderPlayerMarkers();
        
        // 隐藏弹窗
        hideBuyModal();
        
        // 切换玩家
        setTimeout(() => {
            gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
            updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
        }, 1500);
    }
}

// 处理取消
function handleCancel() {
    updateGameMessage(`${currentBuyingPlayer.emoji} ${currentBuyingPlayer.name} 取消购买 ${currentBuyingTile.name}`);
    hideBuyModal();
    
    // 切换玩家
    setTimeout(() => {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        updateGameMessage(`轮到 ${gameState.players[gameState.currentPlayer].emoji} ${gameState.players[gameState.currentPlayer].name} 掷骰子`);
    }, 1500);
}

// 处理机会卡
function handleChanceCard(player, card) {
    switch (card) {
        case '获得100元':
            player.money += 100;
            addMoneyLog(`${player.emoji} 获得 100 元（机会卡）`);
            updatePlayerMoney();
            break;
        case '失去50元':
            player.money -= 50;
            addMoneyLog(`${player.emoji} 失去 50 元（机会卡）`);
            updatePlayerMoney();
            break;
        case '前进3格':
            player.position = (player.position + 3) % TILE_COUNT;
            renderPlayerMarkers();
            break;
        case '后退2格':
            player.position = (player.position - 2 + TILE_COUNT) % TILE_COUNT;
            renderPlayerMarkers();
            break;
        case '直接到起点':
            player.position = 0;
            player.money += 200;
            addMoneyLog(`${player.emoji} 获得 200 元（机会卡-到起点）`);
            updatePlayerMoney();
            renderPlayerMarkers();
            break;
        case '获得50元':
            player.money += 50;
            addMoneyLog(`${player.emoji} 获得 50 元（机会卡）`);
            updatePlayerMoney();
            break;
        case '失去100元':
            player.money -= 100;
            addMoneyLog(`${player.emoji} 失去 100 元（机会卡）`);
            updatePlayerMoney();
            break;
        case '前进到最近的物业':
            // 找到最近的物业
            let nearestProperty = -1;
            for (let i = 1; i < TILE_COUNT; i++) {
                const checkPosition = (player.position + i) % TILE_COUNT;
                if (gameState.tiles[checkPosition].type === TILE_TYPES.PROPERTY) {
                    nearestProperty = checkPosition;
                    break;
                }
            }
            if (nearestProperty !== -1) {
                player.position = nearestProperty;
                renderPlayerMarkers();
            }
            break;
    }
}

// 更新游戏信息
function updateGameMessage(message) {
    gameState.gameMessage = message;
    document.getElementById('gameMessage').textContent = message;
}

// 事件监听器
document.getElementById('rollBtn').addEventListener('click', rollDice);
document.getElementById('buyBtn').addEventListener('click', handleBuy);
document.getElementById('cancelBtn').addEventListener('click', handleCancel);

// 初始化游戏
window.addEventListener('DOMContentLoaded', initGame);

// 响应式调整
window.addEventListener('resize', () => {
    renderPlayerMarkers();
});