import * as THREE from 'three';
import { planeKodam, linkMeshes, rotateKodamExpression } from './objectLoader'; // rotateKodamExpression をインポート

let raycaster;
let mouse;
let camera;
let clickableObjects = []; // kodam も含めるように変更する可能性あり

// クリックカウンター
let kodamClickCount = 0;

function initRaycaster(mainCamera) {
    camera = mainCamera;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // クリック可能なオブジェクトを更新 (初期化時)
    // planeKodam が初期化された後に呼ぶ必要があるため、main.js 側で実行する方が良いかもしれない
    // ここでは一旦 linkMeshes のみ初期化
    clickableObjects = [...linkMeshes];

    window.addEventListener('click', onClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
}

// クリック可能なオブジェクトのリストを更新する関数
function updateClickableObjects() {
    // planeKodam が存在すればリストに追加
    clickableObjects = [...linkMeshes];
    if (planeKodam) {
        clickableObjects.push(planeKodam);
    }
    // console.log('Clickable objects updated:', clickableObjects); // デバッグ用
}

function onClick(event) {
    // マウス座標を正規化デバイス座標 (-1 to +1) に変換
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // レイキャスターを更新
    raycaster.setFromCamera(mouse, camera);

    // クリック可能なオブジェクトとの交差を検出
    // updateClickableObjects を呼んで最新のリストを使う
    updateClickableObjects();
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        // Kodam がクリックされた場合の処理
        if (intersectedObject.name === "kodam") { // 名前で判定
            kodamClickCount++;
            // console.log(`Kodam clicked: ${kodamClickCount}`); // デバッグ用
            if (kodamClickCount % 5 === 0) {
                // console.log('Rotating expression!'); // デバッグ用
                rotateKodamExpression();
            }
        }
        // リンクオブジェクトがクリックされた場合の処理 (既存のロジック)
        else if (intersectedObject.userData && intersectedObject.userData.type === 'link') {
            console.log('Link clicked:', intersectedObject.userData.url);
            window.open(intersectedObject.userData.url, '_blank');
        }
        // 他のクリック可能なオブジェクトタイプがあればここに追加
        // else if (intersectedObject.name === "someOtherObject") { ... }
    }
}

function onMouseMove(event) {
    // マウス座標を正規化デバイス座標 (-1 to +1) に変換
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // レイキャスターを更新
    raycaster.setFromCamera(mouse, camera);

    // クリック可能なオブジェクトとの交差を検出
    updateClickableObjects(); // マウスオーバー検出のためにもリストを更新
    const intersects = raycaster.intersectObjects(clickableObjects);

    // カーソルスタイルの変更
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        // Kodam またはリンクの上にマウスがある場合
        if (intersectedObject.name === "kodam" || (intersectedObject.userData && intersectedObject.userData.type === 'link')) {
             document.body.style.cursor = 'pointer';
        } else {
             document.body.style.cursor = 'default';
        }
    } else {
        document.body.style.cursor = 'default';
    }
}

export { initRaycaster, updateClickableObjects }; // updateClickableObjects もエクスポート 
