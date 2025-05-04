import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let cameraRef; // カメラへの参照を保持
let clickableObjects = []; // クリック対象オブジェクトの配列

function onMouseClick(event) {
    // Canvas内の相対的なマウスポインタ位置を計算 (-1 to +1)
    const rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasterを更新
    raycaster.setFromCamera(mouse, cameraRef);

    // オブジェクトとの交差を検出
    const intersects = raycaster.intersectObjects(clickableObjects, true); // trueで子孫もチェック

    if (intersects.length > 0) {
        // 最初に交差したオブジェクトを取得
        // 念のため、最も近い表示オブジェクトを探す (透明なPlaneが重なる場合など)
        let targetObject = null;
        for (const intersect of intersects) {
            // userData.urlを持つ最も近いオブジェクトを見つける
            if (intersect.object.userData && intersect.object.userData.url) {
                targetObject = intersect.object;
                break; // 最初に見つかったものを採用
            }
        }

        // userDataにurlがあるかチェック
        if (targetObject && targetObject.userData && targetObject.userData.url) {
            console.log(`Clicked on ${targetObject.userData.name || 'object'}, navigating to: ${targetObject.userData.url}`);
            // 新しいタブでURLを開く
            window.open(targetObject.userData.url, '_blank'); 
            // または現在のタブで遷移:
            // window.location.href = targetObject.userData.url;
        }
    }
}

// イベントリスナーを設定する初期化関数
function initializeRaycaster(renderer, camera, objects) {
    cameraRef = camera;
    clickableObjects = objects; // クリック対象のオブジェクトを更新
    // Remove existing listener before adding a new one to prevent duplicates
    renderer.domElement.removeEventListener('click', onMouseClick, false);
    renderer.domElement.addEventListener('click', onMouseClick, false);
    console.log('Raycaster initialized. Clickable objects:', clickableObjects.map(o => o.userData.name || 'Unnamed')); // Log names
}

export { initializeRaycaster }; 
