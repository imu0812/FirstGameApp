const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const projectRoot = path.resolve(__dirname, '..');
const arsenalPath = path.join(projectRoot, 'src', 'game', 'data', 'arsenal.js');
const outputDir = path.join(projectRoot, 'exports');
const outputPath = path.join(outputDir, 'skills-overview.xlsx');

function loadArsenalDefinitions() {
  const source = fs.readFileSync(arsenalPath, 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ');

  const script = new vm.Script(`${source}\nmodule.exports = { WEAPON_DEFS, PASSIVE_DEFS };`);
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  script.runInContext(context);
  return context.module.exports;
}

function msToSeconds(ms) {
  return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 2).replace(/\.?0+$/, '')} 秒`;
}

function percentFromMultiplier(multiplier, invert = false) {
  if (invert) {
    return `${Math.round((1 - multiplier) * 100)}%`;
  }

  return `${Math.round((multiplier - 1) * 100)}%`;
}

function formatWeaponLevel(type, level, index) {
  const parts = [];

  if (level.damage != null) {
    parts.push(`傷害 ${level.damage}`);
  }

  if (level.cooldown != null) {
    parts.push(`冷卻 ${msToSeconds(level.cooldown)}`);
  }

  if (level.range != null) {
    parts.push(`射程 ${level.range}`);
  }

  if (level.projectiles != null) {
    parts.push(`投射物 ${level.projectiles}`);
  }

  if (level.count != null) {
    parts.push(`環刃數 ${level.count}`);
  }

  if (level.radius != null && ['explosive', 'explosive_dot', 'orbit'].includes(type)) {
    const label = type === 'orbit' ? '環繞半徑' : '爆炸半徑';
    parts.push(`${label} ${level.radius}`);
  }

  if (level.pierce != null && level.pierce > 0 && level.pierce < 99) {
    parts.push(`穿透 ${level.pierce}`);
  }

  if (level.slowMultiplier != null) {
    parts.push(`緩速 ${percentFromMultiplier(level.slowMultiplier, true)}`);
  }

  if (level.freezeDuration != null && level.freezeDuration > 0) {
    parts.push(`冰凍 ${msToSeconds(level.freezeDuration)}`);
  }

  if (level.burnDamage != null) {
    parts.push(`燃燒每跳 ${level.burnDamage}`);
  }

  if (level.burnDuration != null) {
    parts.push(`燃燒持續 ${msToSeconds(level.burnDuration)}`);
  }

  if (level.groundDuration != null) {
    parts.push(`燃地持續 ${msToSeconds(level.groundDuration)}`);
  }

  if (level.groundTickDamage != null) {
    parts.push(`燃地每跳 ${level.groundTickDamage}`);
  }

  if (level.chainCount != null) {
    parts.push(`連鎖次數 ${level.chainCount}`);
  }

  if (level.chainRange != null) {
    parts.push(`連鎖距離 ${level.chainRange}`);
  }

  if (level.branchCount != null && level.branchCount > 0) {
    parts.push(`分支弧線 ${level.branchCount}`);
  }

  if (level.branchChains != null && level.branchChains > 0) {
    parts.push(`每條分支再連 ${level.branchChains}`);
  }

  if (level.outboundDuration != null) {
    parts.push(`外拋時間 ${msToSeconds(level.outboundDuration)}`);
  }

  if (level.returnSpeedMultiplier != null) {
    parts.push(`回收速度 ${Math.round(level.returnSpeedMultiplier * 100)}%`);
  }

  if (level.knockbackForce != null && level.knockbackForce > 0) {
    parts.push(`擊退 ${level.knockbackForce}`);
  }

  if (level.summonCount != null) {
    parts.push(`砲台數 ${level.summonCount}`);
  }

  if (level.summonDuration != null) {
    parts.push(`存在 ${msToSeconds(level.summonDuration)}`);
  }

  if (level.poisonDamage != null) {
    parts.push(`中毒每跳 ${level.poisonDamage}`);
  }

  if (level.poisonDuration != null) {
    parts.push(`中毒持續 ${msToSeconds(level.poisonDuration)}`);
  }

  if (level.corrosionBonus != null) {
    parts.push(`腐蝕增傷 ${Math.round(level.corrosionBonus * 100)}%`);
  }

  if (level.splashRadius != null) {
    parts.push(`濺射半徑 ${level.splashRadius}`);
  }

  if (level.splashDamage != null) {
    parts.push(`濺射傷害 ${level.splashDamage}`);
  }

  if (level.rootDuration != null && level.rootDuration > 0) {
    parts.push(`定身 ${msToSeconds(level.rootDuration)}`);
  }

  if (type === 'boomerang' && index <= 2) {
    parts.push('可往返二次命中');
  }

  return parts.join(' | ');
}

function aggregateProjectilePassive(levels, targetLevel) {
  const aggregate = {
    projectileBonus: 0,
    cooldownMultiplier: 1,
    projectileSpeedBonus: 0
  };

  for (let index = 0; index < targetLevel; index += 1) {
    const level = levels[index];
    aggregate.projectileBonus += level.projectileBonus ?? 0;
    aggregate.cooldownMultiplier *= level.cooldownMultiplier ?? 1;
    aggregate.projectileSpeedBonus += level.projectileSpeedBonus ?? 0;
  }

  return aggregate;
}

function formatPassiveLevel(key, levels, targetLevel) {
  if (key === 'attack_frequency') {
    const { fireRateMultiplier } = levels[targetLevel - 1];
    return `全武器冷卻縮短 ${percentFromMultiplier(fireRateMultiplier, true)}`;
  }

  if (key === 'damage_boost') {
    const { damageMultiplier } = levels[targetLevel - 1];
    return `全傷害提高 ${percentFromMultiplier(damageMultiplier)}`;
  }

  if (key === 'projectile_count') {
    const aggregate = aggregateProjectilePassive(levels, targetLevel);
    const effects = [];

    if (aggregate.projectileBonus > 0) {
      effects.push(`額外投射物 +${aggregate.projectileBonus}`);
    }

    if (aggregate.cooldownMultiplier < 1) {
      effects.push(`冷卻縮短 ${percentFromMultiplier(aggregate.cooldownMultiplier, true)}`);
    }

    if (aggregate.projectileSpeedBonus > 0) {
      effects.push(`投射速度 +${Math.round(aggregate.projectileSpeedBonus * 100)}%`);
    }

    return effects.join(' | ');
  }

  if (key === 'move_speed') {
    return `移動速度 +${levels[targetLevel - 1].moveSpeedBonus}`;
  }

  if (key === 'pickup_radius') {
    return `拾取半徑 +${levels[targetLevel - 1].pickupRadiusBonus}`;
  }

  const level = levels[targetLevel - 1];
  return `最大生命 +${level.maxHealthBonus} | 升級時回復 ${level.healOnGain}`;
}

const weaponRoleNotes = {
  arc_bolt: {
    functionText: '自動鎖定最近敵人的基礎單體輸出武器，出手穩定、容錯高，前中期清線與補刀都很順。',
    suitability: '適合新手開局、單體輸出、追擊高速目標。和攻速提升、傷害強化、投射增幅都相性很好。'
  },
  halo_disc: {
    functionText: '環繞玩家持續切割近身敵人的常駐區域武器，不靠瞄準，能在走位時保持貼身壓制。',
    suitability: '適合近身風箏、被包圍時自保、持續碰撞輸出。和移動速度、傷害強化、投射增幅很搭。'
  },
  comet_lance: {
    functionText: '穿透型冰槍，主打直線輸出與控場，能靠緩速與後期冰凍穩住敵群節奏。',
    suitability: '適合打菁英與 Boss、對付直線湧入敵人、需要控制時帶。和攻速、傷害、投射增幅相性佳。'
  },
  flame_orb: {
    functionText: '爆炸加燃燒的範圍持續輸出武器，後期還能留下燃地，擅長清大群與守路口。',
    suitability: '適合大量雜兵、長時間拉扯、地形控區。和傷害強化、攻速提升、投射增幅都很契合。'
  },
  chain_thunder: {
    functionText: '命中主目標後向周圍跳電的連鎖武器，清分散中小怪非常快，後期分支弧線可進一步擴散。',
    suitability: '適合清雜、清散開敵群、快速回收場面壓力。和傷害強化、攻速提升、投射增幅是核心組合。'
  },
  gale_boomerang: {
    functionText: '高穿透迴旋風刃，來回路徑能多次命中同一區域目標，後段還附帶擊退。',
    suitability: '適合走位拉扯、狹長路徑、對付成排敵人。和投射增幅、傷害強化、移動速度搭配感很強。'
  },
  vine_turret: {
    functionText: '在玩家周圍架設自動砲台，提供獨立火力、中毒持續傷害與腐蝕增傷，最終可濺射並定身。',
    suitability: '適合站位經營、打 Boss、需要穩定掛狀態的流派。和傷害強化、攻速提升、最大生命都不錯。'
  },
  nova_bloom: {
    functionText: '拋物式爆炸種子，節奏較慢但單發範圍與爆發都高，適合補重擊與範圍清場。',
    suitability: '適合爆發、守群聚、補足大範圍 AoE。和傷害強化、攻速提升、投射增幅很搭。'
  }
};

const passiveRoleNotes = {
  attack_frequency: {
    functionText: '全武器共通的節奏強化，直接縮短冷卻，是泛用度最高的輸出型被動之一。',
    suitability: '幾乎適合所有主動技能，特別是冷卻明顯的爆炸、連鎖、砲台流派。'
  },
  damage_boost: {
    functionText: '全傷害乘區強化，會同步放大直擊、燃燒、毒傷與地面持續傷害。',
    suitability: '適合所有輸出流派，尤其是多段 DoT、爆炸與連鎖類武器。'
  },
  projectile_count: {
    functionText: '累積型彈道被動，會逐級增加投射數、冷卻效率與彈速，是成長性很高的泛用被動。',
    suitability: '最適合所有會吃投射數的武器，例如飛矢、冰箭、火球、雷擊、迴旋刃與爆炸種子。'
  },
  move_speed: {
    functionText: '提升走位與拉怪彈性，也讓近身環刃與回收型武器更容易保持理想輸出路徑。',
    suitability: '適合風箏、生存導向、近身環刃或迴力鏢玩法。'
  },
  pickup_radius: {
    functionText: '提高經驗與掉落物吸附範圍，連帶增加吸附速度，能顯著改善成長與撿取手感。',
    suitability: '適合需要快速滾雪球的局、移動掃圖玩法，以及想減少回頭撿資源的配置。'
  },
  max_health: {
    functionText: '提高生命上限並在升級時立即補血，偏生存與容錯，對長局與 Boss 壓力很有幫助。',
    suitability: '適合新手、近身打法、Boss 戰、生存優先的配置。'
  }
};

function buildWeaponRows(weaponDefs) {
  return Object.values(weaponDefs).map((weapon) => ({
    key: weapon.key,
    name: weapon.name,
    category: '主動',
    type: weapon.type,
    summary: weapon.unlockDescription,
    functionText: weaponRoleNotes[weapon.key].functionText,
    suitability: weaponRoleNotes[weapon.key].suitability,
    lv1: formatWeaponLevel(weapon.type, weapon.levels[0], 1),
    lv2: formatWeaponLevel(weapon.type, weapon.levels[1], 2),
    lv3: formatWeaponLevel(weapon.type, weapon.levels[2], 3),
    lv4: formatWeaponLevel(weapon.type, weapon.levels[3], 4),
    lv5: formatWeaponLevel(weapon.type, weapon.levels[4], 5)
  }));
}

function buildPassiveRows(passiveDefs) {
  return Object.values(passiveDefs).map((passive) => ({
    key: passive.key,
    name: passive.name,
    category: '被動',
    type: passive.stackMode === 'cumulative' ? 'cumulative' : 'stat',
    summary: passive.unlockDescription,
    functionText: passiveRoleNotes[passive.key].functionText,
    suitability: passiveRoleNotes[passive.key].suitability,
    lv1: formatPassiveLevel(passive.key, passive.levels, 1),
    lv2: formatPassiveLevel(passive.key, passive.levels, 2),
    lv3: formatPassiveLevel(passive.key, passive.levels, 3),
    lv4: formatPassiveLevel(passive.key, passive.levels, 4),
    lv5: formatPassiveLevel(passive.key, passive.levels, 5)
  }));
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index) {
  let value = '';
  let current = index;

  while (current >= 0) {
    value = String.fromCharCode((current % 26) + 65) + value;
    current = Math.floor(current / 26) - 1;
  }

  return value;
}

function buildSheetXml(rows, columns) {
  const dimension = `${columnName(0)}1:${columnName(columns.length - 1)}${rows.length + 1}`;
  const headerRow = columns.map((column, index) => {
    const cellRef = `${columnName(index)}1`;
    return `<c r="${cellRef}" s="1" t="inlineStr"><is><t>${xmlEscape(column.header)}</t></is></c>`;
  }).join('');

  const dataRows = rows.map((row, rowIndex) => {
    const cells = columns.map((column, columnIndex) => {
      const cellRef = `${columnName(columnIndex)}${rowIndex + 2}`;
      return `<c r="${cellRef}" s="2" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(row[column.key])}</t></is></c>`;
    }).join('');
    return `<row r="${rowIndex + 2}">${cells}</row>`;
  }).join('');

  const columnWidths = columns.map((column, index) => (
    `<col min="${index + 1}" max="${index + 1}" width="${column.width}" customWidth="1"/>`
  )).join('');

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    `<dimension ref="${dimension}"/>`,
    '<sheetViews><sheetView workbookViewId="0"/></sheetViews>',
    `<cols>${columnWidths}</cols>`,
    `<sheetData><row r="1">${headerRow}</row>${dataRows}</sheetData>`,
    '<pageMargins left="0.4" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>',
    '</worksheet>'
  ].join('');
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];

    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBuffer = Buffer.from(entry.name.replace(/\\/g, '/'));
    const dataBuffer = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const compressed = zlib.deflateRawSync(dataBuffer);
    const crc = crc32(dataBuffer);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + compressed.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralSize, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, endRecord]);
}

function buildWorkbookFiles(weaponRows, passiveRows) {
  const columns = [
    { key: 'name', header: '技能名稱', width: 18 },
    { key: 'key', header: '技能 Key', width: 18 },
    { key: 'category', header: '分類', width: 10 },
    { key: 'type', header: '機制類型', width: 16 },
    { key: 'summary', header: '原始說明', width: 34 },
    { key: 'functionText', header: '功能作用', width: 44 },
    { key: 'suitability', header: '適性', width: 44 },
    { key: 'lv1', header: 'Lv1', width: 38 },
    { key: 'lv2', header: 'Lv2', width: 38 },
    { key: 'lv3', header: 'Lv3', width: 38 },
    { key: 'lv4', header: 'Lv4', width: 38 },
    { key: 'lv5', header: 'Lv5', width: 38 }
  ];

  const activeSheet = buildSheetXml(weaponRows, columns);
  const passiveSheet = buildSheetXml(passiveRows, columns);
  const stylesXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<fonts count="2">',
    '<font><sz val="11"/><name val="Microsoft JhengHei"/></font>',
    '<font><b/><sz val="11"/><name val="Microsoft JhengHei"/></font>',
    '</fonts>',
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>',
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
    '<cellXfs count="3">',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>',
    '</cellXfs>',
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',
    '</styleSheet>'
  ].join('');

  return [
    {
      name: '[Content_Types].xml',
      data: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
        '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
        '</Types>'
      ].join('')
    },
    {
      name: '_rels/.rels',
      data: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
        '</Relationships>'
      ].join('')
    },
    {
      name: 'docProps/app.xml',
      data: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">',
        '<Application>Codex</Application>',
        '<HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>2</vt:i4></vt:variant></vt:vector></HeadingPairs>',
        '<TitlesOfParts><vt:vector size="2" baseType="lpstr"><vt:lpstr>主動技能</vt:lpstr><vt:lpstr>被動技能</vt:lpstr></vt:vector></TitlesOfParts>',
        '</Properties>'
      ].join('')
    },
    {
      name: 'docProps/core.xml',
      data: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
        '<dc:creator>Codex</dc:creator>',
        '<cp:lastModifiedBy>Codex</cp:lastModifiedBy>',
        `<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>`,
        `<dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>`,
        '<dc:title>Skills Overview</dc:title>',
        '</cp:coreProperties>'
      ].join('')
    },
    {
      name: 'xl/workbook.xml',
      data: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheets>',
        '<sheet name="主動技能" sheetId="1" r:id="rId1"/>',
        '<sheet name="被動技能" sheetId="2" r:id="rId2"/>',
        '</sheets>',
        '</workbook>'
      ].join('')
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>',
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>',
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
        '</Relationships>'
      ].join('')
    },
    { name: 'xl/worksheets/sheet1.xml', data: activeSheet },
    { name: 'xl/worksheets/sheet2.xml', data: passiveSheet },
    { name: 'xl/styles.xml', data: stylesXml }
  ];
}

function main() {
  const { WEAPON_DEFS, PASSIVE_DEFS } = loadArsenalDefinitions();
  const weaponRows = buildWeaponRows(WEAPON_DEFS);
  const passiveRows = buildPassiveRows(PASSIVE_DEFS);
  const workbookFiles = buildWorkbookFiles(weaponRows, passiveRows);
  const zipBuffer = createZip(workbookFiles);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, zipBuffer);

  console.log(`Exported ${weaponRows.length} active skills and ${passiveRows.length} passive skills to ${outputPath}`);
}

main();
