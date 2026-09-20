import React from 'react'
import useRoomStore from '../../app/useRoomStore'

const Rooms = () => {

  const roomList = useRoomStore((state) => state.roomList)

  console.log("roomList", roomList)

  return (
    <div>Rooms</div>
  )
}

export default Rooms