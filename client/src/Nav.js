import React, {useState} from 'react'
import {useNavigate} from "react-router-dom"

function Nav() {
    const [stock, setStock] = useState("")
    const navigate = useNavigate();

    const onStockChange = e => {
        setStock(e.target.value)
    }

    const searchStock = e => {
        e.preventDefault();
        if (stock !== "") {
            navigate(`/${stock.toUpperCase()}`)
        }
    }

    return (
        <div className="h-20 bg-white shadow-md flex flex-col justify-center">
            <form className="flex flex-row mx-auto" onSubmit={searchStock}>
                <input className="w-80 px-3 py-2 border border-black shadow-slate-300 rounded-sm uppercase" type="text" placeholder='Search for a stock ticker (e.g. MSFT, APPL)' onChange={onStockChange}></input>
                <input className="px-4 py-2 bg-blue-700 hover:bg-blue-900 duration-200 active:bg-blue-900 text-white text-xl" type="submit" value="Search"></input>
            </form>
        </div>
    )
}

export default Nav