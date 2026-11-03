# Storyboard (스토리보드)

A desktop storyboard app for planning shots — cut by cut — with camera work, reference images, script, dialogue and direction notes. Works on Windows and macOS. Supports 9:16, 16:9, 1:1 and 4:5 frames.

세로·가로 영상의 콘티를 컷 단위로 정리하는 데스크톱 앱. 컷마다 카메라 워킹, 레퍼런스 이미지, 대본 본문, 대사, 연출 메모를 정리한다. 윈도우와 맥에서 쓸 수 있고 9:16, 16:9, 1:1, 4:5 화면 비율을 지원한다.

---

## English

### Download
Get the latest installer from **Releases**.

| File | For |
|---|---|
| `Storyboard-Setup-<version>.exe` | Windows (installer) |
| `Storyboard-Portable-<version>.exe` | Windows (no install, single file) |
| `Storyboard-<version>-mac.dmg` | macOS (Intel and Apple Silicon) |

The app is not code-signed. On Windows, click **More info › Run anyway** the first time. On macOS, right-click the app in Finder and choose **Open**.

### How to use
1. **Create a project**: click ☰ (top left) › **New project**, enter a name and default frame ratio, then choose where to save the project file (`.json`).
2. **Episodes**: add, rename, reorder or delete episodes in the left sidebar.
3. **Cuts**: hover between cards and click **+ Add cut**. Use the ↑ ↓ ⧉ × buttons on a card to move, duplicate or delete it. Cut numbers update automatically.
4. **Camera work**: click any of the six camera tiles (shot size, angle, facing, composition, movement, lens) to pick a setting with an illustration.
5. **References**: click **＋** on a card, pick suggestions that match the camera settings, or drag & drop / paste / choose your own images. Your images are kept in **My references** and can be reused in any project.
6. **Text**: type or paste the script, dialogue and direction notes into each cut.
7. **Frame ratio**: set the project default in the sidebar, or override a single cut from the selector at the top right of the card.
8. **Save**: `Ctrl/Cmd+S`. Changes are also saved automatically 3 seconds after you stop editing. Undo `Ctrl/Cmd+Z`, redo `Ctrl+Y` / `Cmd+Shift+Z`.
9. **Projects list (☰)**: switch projects, drag to reorder, 📌 pin to the top, rename, remove from the list, or delete (moved to the trash).
10. **Export**: PDF storyboard book, Excel, PNG card per cut, project JSON, or an **AI folder** (Markdown + JSON + images) that AI assistants can read directly.
11. **Theme**: ☀/☾ at the top right switches light and dark mode.

---

## 한글

### 받기
저장소 **Releases**에서 최신 설치 파일을 받는다.

| 파일 | 용도 |
|---|---|
| `Storyboard-Setup-<버전>.exe` | 윈도우 설치판 |
| `Storyboard-Portable-<버전>.exe` | 윈도우 휴대용 (설치 없이 파일 하나로 실행) |
| `Storyboard-<버전>-mac.dmg` | 맥 (인텔·애플 실리콘 모두) |

서명하지 않은 앱이라 처음 실행할 때 윈도우는 **추가 정보 › 실행**, 맥은 Finder에서 **우클릭 › 열기**로 연다.

### 사용법
1. **프로젝트 만들기**: 왼쪽 위 ☰ › **새 프로젝트** → 이름과 기본 화면 비율을 정하고, 프로젝트 파일(`.json`)을 저장할 위치를 고른다.
2. **화**: 왼쪽 목록에서 화를 추가하고, 이름 바꾸기·순서 변경·삭제를 한다.
3. **컷**: 카드 사이에 마우스를 올리면 나오는 **+ 컷 추가**를 누른다. 카드 오른쪽 위 ↑ ↓ ⧉ ×로 옮기기·복제·삭제를 하고, 컷 번호는 자동으로 다시 매겨진다.
4. **카메라 워킹**: 샷 크기·앵글·인물 방향·구성·카메라 움직임·렌즈 6칸 중 하나를 누르면 그림을 보며 고를 수 있다.
5. **레퍼런스**: 카드의 **＋**를 누르거나, 카메라 설정에 맞는 추천 사진을 누른다. 내 사진은 끌어다 놓기·붙여넣기·파일 선택으로 넣고, **내 레퍼런스**에 저장되어 다른 프로젝트에서도 쓸 수 있다.
6. **글**: 컷마다 대본 본문·대사·연출 메모 칸에 적거나 붙여넣는다.
7. **화면 비율**: 왼쪽에서 프로젝트 기본 비율을 정하고, 카드 오른쪽 위 비율 칸에서 그 컷만 따로 바꿀 수 있다.
8. **저장**: `Ctrl/Cmd+S`. 바꾼 뒤 3초가 지나면 자동 저장된다. 되돌리기 `Ctrl/Cmd+Z`, 앞으로가기 `Ctrl+Y` / `Cmd+Shift+Z`.
9. **프로젝트 목록(☰)**: 프로젝트 전환, 끌어서 순서 바꾸기, 📌 상단 고정, 이름 바꾸기, 목록에서 빼기, 삭제(휴지통으로 이동).
10. **내보내기**: PDF 콘티북, 엑셀, 컷 카드 PNG, 프로젝트 JSON, AI가 바로 읽을 수 있는 **AI용 폴더**(Markdown + JSON + 이미지).
11. **테마**: 오른쪽 위 ☀/☾로 밝은 화면과 어두운 화면을 바꾼다.

---

## Development / 개발

```bash
npm install
npm start              # run the app / 앱 실행
npm run dist:win       # Windows installer + portable exe → dist/
npm run dist:mac       # macOS dmg (on a Mac)
```

- UI source / 화면 소스: `app/src/` (`src.html`, `viz.js`, `viz.css`). `npm start`/`dist` rebuilds `app/index.html`.
- Built-in references / 기본 레퍼런스: `app/data/ref/<id>.jpg` (short side 720px; small originals upscaled with Real-ESRGAN x4plus), tags in `app/data/refs.json`. Camera illustrations: `app/cam/`.
- Pushing to `main` builds macOS and Windows with GitHub Actions and uploads them to **Releases** (`v<package.json version>`). / `main`에 올리면 GitHub Actions가 맥·윈도우를 빌드해 Releases에 올린다.
- Smoke test / 자동 점검: `CONTI_SMOKE=<empty folder> npx electron .` → results in `<folder>/smoke-result.json`.
