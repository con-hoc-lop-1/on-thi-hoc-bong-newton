import React, {Fragment, useEffect, useState} from "react";
import DrawDiagram from "./drawDiagram";

export default function App() {
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [ready, setReady] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const x = 15;
    const y = 2;

    const handleAnswer = (index) => {
        setSelected(index);
        if (index === questions[current].answer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        setSelected(null);
        if (current + 1 < questions.length) {
            setCurrent(current + 1);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setCurrent(0);
        setScore(0);
        setShowResult(false);
        setSelected(null);
    };

    const fetchQuestions = async () => {
        const promises = [];
        for (let i = 1; i <= x; i++) {
            promises.push(
                fetch(`/react-on-tap-toan-lop-1/questions/${i}.json`)
                    .then(response => response.json())
                    .then((result) => {
                        let data = result.data.sort(() => 0.5 - Math.random()).slice(0, y)
                        data = data.map(item => ({
                            ...item,
                            name: result.name,
                            type: result.type,
                            special: result.special,
                            signal: result.signal,
                            suggest: result.guide
                        }));
                        return data
                    })
            );
        }
        const questions = await Promise.all(promises);
        return questions.flat().sort(() => 0.5 - Math.random()).slice(0, 20);
        // return questions.flat();
    };

    useEffect(() => {
        if (!ready)
            fetchQuestions().then((data) => {
                console.log(data)
                setQuestions(data);
                setReady(true);
            });
    }, []);

    return (
        <div style={{maxWidth: 800, margin: '0 auto', padding: 24}}>
            {!showResult && ready ? (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h2>Câu {current + 1}/20:</h2>
                    </div>

                    <p dangerouslySetInnerHTML={{__html: questions[current].question}}/>
                    {questions[current].diagram && <DrawDiagram diagram={questions[current].diagram}/>}
                    <div style={{marginTop: 20}}>
                        {questions[current].options.map((option, idx) => (
                            <button
                                className={`btn d-flex mt-2 btn-${selected !== null && idx === questions[current].answer ? 'success' : idx === selected ? 'danger' : 'secondary'}`}
                                key={idx}
                                disabled={selected !== null}
                                onClick={() => handleAnswer(idx)}
                            >
                                {String.fromCharCode(65 + idx)}. {option}
                            </button>
                        ))}
                    </div>
                    <hr/>
                    <div className='guide'>
                        <div className='mt-4'>
                            <p><strong>Hướng dẫn:</strong></p>
                            <div dangerouslySetInnerHTML={{__html: questions[current].guide}}/>
                        </div>
                        <div className='mt-4'>
                            <div><strong>Dạng đề:</strong> {questions[current].name}</div>
                            <div><strong>Kiểu đề:</strong> {questions[current].type}</div>
                            <div><strong>Đặc điểm trong bài:</strong>
                                <ul>
                                    {questions[current].special.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div><strong>Dấu hiệu nhận biết:</strong>
                                <ul>
                                    {questions[current].signal.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div><strong>Gợi ý:</strong>
                                <div dangerouslySetInnerHTML={{__html: questions[current].suggest}}/>
                            </div>
                        </div>

                    </div>
                    {selected !== null && (
                        <div className="mt-4">
                            <p><strong>Đáp án
                                đúng:</strong> {String.fromCharCode(65 + questions[current].answer)}. {questions[current].options[questions[current].answer]}
                            </p>
                            <button className="btn btn-primary mt-4" onClick={handleNext}>Câu tiếp theo</button>
                        </div>
                    )}
                </Fragment>
            ) : (
                <div style={{textAlign: 'center'}}>
                    <h2>🎉 Tổng kết</h2>
                    <p>Con đã trả lời đúng {score} / {questions.length} câu hỏi.</p>
                    {score === 20 && <p>🏆 Con thật tuyệt vời! Đạt điểm tối đa!</p>}
                    {score >= 10 && score < 20 && <p>👍 Con đã làm rất tốt! Cố thêm chút nữa nhé!</p>}
                    {score < 10 && <p>💪 Không sao cả, mình cùng ôn lại và chơi lại nhé!</p>}
                    <button onClick={handleRestart}>Chơi lại</button>
                </div>
            )}
        </div>
    );
}
