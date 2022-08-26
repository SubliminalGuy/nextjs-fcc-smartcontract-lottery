import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants/index"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const [lotteryState, setLotteryState] = useState("Unknown")
    const [timeInterval, setTimeInterval] = useState("Unknown")

    const dispatch = useNotification()

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi,
        contractAddress: lotteryAddress, //specifiy NetworkId
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    const { runContractFunction: getLotteryState } = useWeb3Contract({
        abi,
        contractAddress: lotteryAddress,
        functionName: "getLotteryState",
        params: {},
    })

    const { runContractFunction: getInterval } = useWeb3Contract({
        abi,
        contractAddress: lotteryAddress,
        functionName: "getInterval",
        params: {},
    })

    async function updateUI() {
        let entranceFeeFromCall = await getEntranceFee()
        let numberOfPlayersFromCall = (await getNumberOfPlayers()).toString()
        let recentWinnerFromCall = await getRecentWinner()
        let lotteryStateFromCall =
            (await getLotteryState()).toString() == 0 ? "OPEN" : "CALCULATING"
        let intervalFromCall = (await getInterval()).toString()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numberOfPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
        setLotteryState(lotteryStateFromCall)
        setTimeInterval(intervalFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Info",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Get lucky in our Blockchain Lottery. For just 0.1 ETH!
            {lotteryAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Lottery</div>
                        )}
                    </button>
                    <div>
                        Lottery Entrance Fee is {ethers.utils.formatUnits(entranceFee, "ether")}{" "}
                        ETH
                    </div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                    <div>The Lottery is: {lotteryState}</div>
                    <div>Lottery Time Intervall: {timeInterval}</div>
                </div>
            ) : (
                <div>No Lottery Address Detected!</div>
            )}
        </div>
    )
}
