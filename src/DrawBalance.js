import {Fragment} from "react";

export default function DrawBalance({balance}) {
    const {balance1, balance2, balance3} = balance
    const style1 = {
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "#ffffff",
        borderRadius: "12px",
        padding: "6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "relative",
        height: "180px"
    };

    const style2 = {
        width: "160px",
        textAlign: "center",
        padding: "2px",
        border: "2px solid #ccc",
        borderRadius: "8px",
        zIndex: 1
    };

    const style3 = {
        position: "absolute",
        zIndex: 0,
        bottom: 10
    };

    return (
        <div
            style={{display: "flex", flexDirection: "column", gap: "20px", fontSize: "16px", fontFamily: "sans-serif"}}>
            <div style={style1}>
                <div style={style2}>
                    {balance1.icon1.map((i, index) => <Fragment key={index}>{i}</Fragment>)}
                </div>
                <div style={{...style2, marginLeft: "40px"}}>
                    {balance1.icon2.map((i, index) => <Fragment key={index}>{i}</Fragment>)}
                </div>
                <img alt="cân"
                     src="/react-on-tap-toan-lop-1/images/can.png"
                     style={style3}/>
            </div>
            <div style={style1}>
                <div style={style2}>
                    {balance2.icon1.map((i, index) => <Fragment key={index}>{i}</Fragment>)}
                </div>
                <div style={{...style2, marginLeft: "40px"}}>
                    {balance2.icon2.map((i, index) => <Fragment key={index}>{i}</Fragment>)}
                </div>
                <img alt="cân"
                     src="/react-on-tap-toan-lop-1/images/can.png"
                     style={style3}/>
            </div>
            <div style={style1}>
                <div style={{...style2, borderColor: "#f88"}}>
                    {balance3.icon1.map((i, index) => <Fragment key={index}>{i}</Fragment>)}
                </div>
                <div style={{...style2, borderColor: "#f88", borderStyle: "dashed", marginLeft: "40px"}}>
                    ❓
                    {balance3.icon2.map((i, index) => <Fragment key={index}>{i}</Fragment>)}
                </div>
                <img alt="cân"
                     src="/react-on-tap-toan-lop-1/images/can.png"
                     style={style3}/>
            </div>
        </div>
    );
}