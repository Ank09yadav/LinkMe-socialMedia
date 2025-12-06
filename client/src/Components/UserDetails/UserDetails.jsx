import React from 'react'

const UserDetails = ({ user }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <img src={user.avatar} alt={`${user.name}'s avatar`} />
      <p>{user.message}</p>
      <p>{user.time}</p>
    </div>
  )
}

export default UserDetails