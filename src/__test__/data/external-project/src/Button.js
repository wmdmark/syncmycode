import React from "react"

// TODO: write a test that updates this

export default Button = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>
}
