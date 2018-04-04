import React, { Component } from 'react'
import request from 'superagent'
import './ProfileImageUploader.css'

const CLOUDINARY_UPLOAD_PRESET = 'p3ntnzxu'
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/woohyeon/upload'


class ProfileImageUploader extends Component {
  constructor(props) {
    super(props)

    this.state = {
      uploadedFile: null,
      uploadedFileCloudinaryUrl: '',
    }
  }

  uploadFile = () => {
    const uploadedFile = this.fileInput.files[0]
    this.setState({
      uploadedFile,
    })

    this.handleImageUpload(uploadedFile)
  }

  handleImageUpload = (file) => {
    let upload = request.post(CLOUDINARY_UPLOAD_URL)
      .field('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      .field('file', file)

    upload.end((err, response) => {
      if (err) {
        console.error(err)
      }

      if (response.body.secure_url !== '') {
        this.setState({
          uploadedFileCloudinaryUrl: response.body.secure_url
        })
      }
    });
  }

  render() {
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
    );
  }
}

export default ProfileImageUploader
