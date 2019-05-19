// Chapter4 Secsion2 課題
// popu-pref.csv より以下を作成。
// 「2010年から2015年にかけて15～19歳の人が増えた割合の都道府県ランキング」
//
// Node.jsのAPIドキュメント
// https://nodejs.org/docs/v8.9.4/api/index.html

'use strict';


// Node.jsより、fsモジュールを呼び出す。
// 疑問：提供されているモジュールを調べる方法？公式サイトで？
const fs = require('fs');

// fsモジュールを使い、CSVファイルの読み込みストリームを得る。
// StreamはC#等にもあるので理解できる。
// モジュールが提供しているメソッドを調べる方法？VSCodeにそういう機能は無いのか。
const rs = fs.ReadStream('./popu-pref.csv');

// readlineモジュールを呼び出し、そのインターフェースを取得する。
const readline = require('readline');
const rl = readline.createInterface({'input': rs, 'output':{}});

// 都道府県名をkeyとし、集計データのオブジェクトをvalueとする連想配列。
// constなので、この変数が指すオブジェクトが他のオブジェクトに差し替わることは無い。
// オブジェクト自体の中身が変わることはある。
const map = new Map();

// rlオブジェクトで'line'というイベントが発生したときのハンドラを設定。
rl.on('line', (lineString) =>
{
    // CSVの１行をカンマで区切り配列化する。
    const columns = lineString.split(',');

    // 集計年(１列名)を取得。対象期間なら次へ進む。
    const yearStr = columns[0];
    if(yearStr != '2010' && yearStr != '2015')
    {
        return;
    }
    const year = parseInt(yearStr);

    // 都道府県名(３列目)、15~19歳の人工(8列目)を取得。
    const pref = columns[2];
    const popu = parseInt(columns[7]);

    // 連想配列から登録データを取得。
    let value = map.get(pref);
    if(!value)
    {
        // 初回登録。
        value = {popu10:0, popu15:0, change: null};
    }

    if(year == 2010)
    {
        value.popu10 += popu;
    }
    else
    {
        value.popu15 += popu;
    }
    map.set(pref, value);
})

// データの読み込みを開始する。
// ※ 実際にはresumeを呼ばなくてもデータの読み込みは開始される。
//   過去にN予備校のフォーラムで同様の質問あり。
//   https://www.nnn.ed.nico/questions/1489
rl.resume();

rl.on('close', ()=>
{
    // 各都道府県の人工の変化率を計算。
    // C++の範囲付きforに似ている。
    for (let pair of map)
    {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }

    // 人口増加率でソート。
    // メソッドチェーンで書いている。
    // Array.from()：新しいArrayインスタンス(配列)を生成。
    // Array.sort()：与えられた判定式に基づいてソートを行う。
    const rankingArray
    = Array .from(map)
            .sort((pair1, pair2)=>
            {
                // 戻り値が負数：最初の要素を先頭に持っていく
                // 戻り値が整数：2番めの要素を先頭に持っていく
                return pair2[1].change - pair1[1].change;
            });

    // ここで使うmap()は連想配列のMapではなく、写像のこと。
    // C#でいう、LINQのSlect()に相当する。
    const rankingStrings = rankingArray.map((pair) =>
    {
        return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率：' + pair[1].change;
    });

    console.log(rankingStrings);
})