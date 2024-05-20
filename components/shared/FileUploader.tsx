import React, { Dispatch, SetStateAction } from 'react'

type FileUploadProps = {
    onFieldChange: (value: string) => void
    imageUrl: string
    setFiles: Dispatch<SetStateAction<File[]>>
}

const FileUploader = ({ onFieldChange, imageUrl, setFiles} : FileUploadProps ) => {
  return (
    <div>FileUploader</div>
  )
}

export default FileUploader