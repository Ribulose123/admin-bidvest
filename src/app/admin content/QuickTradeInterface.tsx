import React from 'react'
import TradeHistory from './TradeHistory'
import QuickTrade from './QuickTrade'
const QuickTradeInterface = () => {
  return (
    <div className="flex flex-col  gap-4 p-4">
      <div className="w-full">
        <QuickTrade />
      </div>
      <div className="w-full">
        <TradeHistory />
      </div>
    </div>
  )
}

export default QuickTradeInterface
