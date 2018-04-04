# ProfileImageUploader

프로필 이미지 업데이트 UI를 만들어보았습니다.

## 1. 계획
### 사용자 시나리오
1. 사용자가 파일을 업로드한다.
2. 프로필 사진 영역에 사용자가 올린 파일 이미지가 보인다.

### 개발 시나리오
1. 사용자가 파일을 업로드한다.
2. 업로드한 파일을 서버에 저장하고, url 값을 가져온다.
3. `background-image`에 url을 지정한다.

업로드한 파일을 서버에 저장해야 사진 이미지를 불러올 경로값을 받아올 수 있다는 점이 tricky하다.

## 2. 준비

### 사용할 것들
1. `create-react-app`: React 개발 시 삶의 질을 향상시킨다.
2. `superagent`: HTTP Request를 보내기 위해 사용. 서버로 부터 이미지 url을 받아오기 위해 사용한다.
3. Cloudinary: 이미지를 올릴 서버

### Cloudinary 설정
먼저, [Cloudinary](https://cloudinary.com/)에 들어가서 회원가입을 한다. Cloudinary에서는 무료 플랜을 제공하니 그걸 이용할 예정. 회원가입을 완료하면, **Dashboard > Settings > Upload > Upload presets의 Add upload presets**를 클릭한다. Mode가 Signed로 되어 있을 텐데, 이를 **Unsigned**로 변경하고 저장한다. 그래야 별도의 로그인 없이 이미지를 서버에 업로드/저장할 수 있기 때문이다.

그럼 아래와 같이 될 것인데, 여기 Preset Name을 복사한다.

![Copy Preset Name](https://user-images.githubusercontent.com/19285811/38290486-5fde9864-3816-11e8-8579-ec3bb06eed8a.png)

### create-react-app profile-image-uploader
본격적으로 리액트 앱을 만들어 보자. `create-react-app`을 통해 새로운 프로젝트를 만든다. 그리고 `superagent`를 설치한다.

```bash
$ create-react-app profile-image-uploader
$ cd profile-image-uploader
$ npm i superagent
```

`App.js` 이름을 편의상 `ProfileImageUploader.js`로 이름을 변경했다. 그리고 리액트 컴포넌트의 기본 골격을 잡아준다. 그리고 우리가 사용할 Cloudinary 설정값도 변수에 함께 지정해주자.

```javascript
import React from 'react'
import request from 'superagent'
import './ProfileImageUploader.css'

const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset_id'
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/your_cloudinary_app_name/upload'

class ProfileImageUploader extends React.Component {
  render () {
    return (
      <section>
        Hello
      </section>
    )
  }
}

export default ProfileImageUploader
```

간단하게 `jsx`를 설계해보자. 나의 계획은 이러하다. 두 개의 요소가 필요한데 하나는 파일을 업로드할 수 있게 하는 `<input type='file'/>`, 다른 하나는 이미지를 보여줄 `<div/>`. `<input/>`은 `opacity: 0`, `position: absolute`로 해서 `<div/>` 위를 덮을 것이다.

```javascript
render () {
  return (
    <section className='profile-image'>
      <input
        type='file'
        className='profile-image__input'
      />
      <div className='profile-image__picture' />
    </section>
  )
}
```

```css
.profile-image {
  position: relative;
  width: 300px;
  height: 300px;
  overflow: hidden;
}

.profile-image__input {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  opacity: 0;
}

.profile-image__picture {
  width: 100px;
  height: 100px;
  border-radius: 100px;
  background-color: #f1f3f5;
}
```

여기까지 했으면 이제 `state` 관리를 해주자. 사용자가 올린 이미지 파일은 `uploadedFile`에, 서버에 이미지를 저장한 후 이미지 url은 `uploadedFileCloudinaryUrl`에 담을 것이다. 먼저 defaultState값을 설정하자.

```javascript
class ProfileImageUploader extends React.Component {
  constructor(props) {
    super(props)

    this,state = {
      uploadedFile: null,
      uploadedFileCloudinaryUrl: '',
    }
  }

  ...
}
```

사용자가 파일을 올렸을 때 해당 파일을 `uploadedFile` 스테이트에 저장하는 로직을 만들자. 파일이 올라갔을 때는 `onChange` 이벤트로 알 수 있다. 
```javascript
uploadFile = () => {
  const file = this.fileInput.files[0]
  
  this.setState({
    uploadedFile: file,
  })
}

render () {
  return (
    <section className='profile-image'>
      <input
        type='file'
        onChange={this.uploadFile}
        ref={input => this.fileInput = input}
        className='profile-image__input'
      />
      <div className='profile-image__picture' />
    </section>
  )
}
```

`<input/>`에서 `onChange`이벤트가 발생했을 때 `this.setState()`를 해줄 녀석은 `uploadFile` 메소드이고, 이미지를 서버에 올리고 이미지 url을 받아오는 일을 처리할 `handleImageUpload` 메소드를 만들자.

```javascript
uploadFile = () => {
  const file = this.fileInput.files[0]

  this.setState({
    uploadedFile: file,
  })

  this.handleImageUpload(file)
}

handleImageUpload = (file) => {
  // 파일을 서버에 올리기 위해 서버에 먼저 request를 보내야 한다.
  // POST Request로 서버에 파일을 저장하자.
  // .field 메소드로 POST Request에 data를 추가할 수 있다.
  let upload = request.post(CLOUDINARY_UPLOAD_URL)
    .field('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    .field('file', file)
  // .field를 통해 업로드 프리셋과 파일을 첨부한 Request 객체를 만들었다.
  // .end()를 통해 리퀘스트를 실제로 서버로 보내면
  // Cloudinary 서버에 이미지가 저장이 될 것이고, 저장된 후에 실행시킬
  // callback함수를 지정해주자.

  upload.end((err, res) => {
    if (err) {
      console.error(err)
    }

    // secure_url을 uploadedFileCloudinaryUrl에 설정하자.
    if (res.body.secure_url !== '') {
      this.setState({
        uploadedFileCloudinaryUrl: res.body.secure_url,
      })
    }
  })
}
```

마지막으로 `this.state.uploadedFileCloudinaryUrl`의 유무에 따라 다른 `<div/>`를 렌더하는 로직을 추가한다.

```javascript
render () {
  const {
    uploadedFileCloudinaryUrl,
  } = this.state

  return (
    <section className='profile-image'>
      <input
        type='file'
        className='profile-image__input'
        ref={input => this.fileInput = input}
        onChange={this.uploadFile}
      />
      {
        uploadedFileCloudinaryUrl
        ? <div
          className='profile-image__picture'
          style={{ backgroundImage: `url(${uploadedFileCloudinaryUrl})` }}
        />
        : <div className='profile-image__picture' />
      }
    </section>
  )
}
```

