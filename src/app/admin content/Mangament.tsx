'use client'
import React, { useState } from 'react'
import AllTransctions from './AllTransctions'

const Mangament = () => {

    const [activeTab, setActiveTab] = useState("All transctions")

    const tabs =[
       "All transctions",
       "Signal" ,
       "Staking & pool",
       "Subscription",
       "Users",
       "Purchase(s)"
    ]

    const rendercontent =()=>{
        switch(activeTab){
            case  "All transctions":
                return(
                    <div><AllTransctions/></div>
                )
            case "Signal":
                return(
                    <div>1</div>
                )
            case "Staking & pool":
                return(
                    <div>4</div>
                )
            case "Subscription":
                return(
                    <div>4</div>
                )
            case "Users":
                return(
                    <div>2</div>
                )
            case "Purchase(s)":
                return(
                    <div>3</div>
                )
        }
    }
  return (
    <div className='pt-5 p-4'>
      <div className='border-b border-[#141E325C] '>
        {tabs.map((tabs)=>(
            <button key={tabs} className={`px-10 py-1 ${activeTab ===tabs ? 'border-b border-[#6967AE]' : ''}`} onClick={()=>setActiveTab(tabs)}>{tabs}</button>
        ))}
      </div>

      <div className='mt-9'>
        {rendercontent()}
      </div>
    </div>
  )
}

export default Mangament
