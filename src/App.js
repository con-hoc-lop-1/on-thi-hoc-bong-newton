import React, {Fragment, useEffect, useState} from "react";
import DrawDiagram from "./drawDiagram";

export default function App() {
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [ready, setReady] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showNext, setShowNext] = useState(false);

    const x = 13;
    const y = 2;

    const handleAnswer = (index) => {
        setSelected(index);
        if (index === questions[current].answer) {
            setScore(score + 1);
        }
        setShowNext(true);
    };

    const handleNext = () => {
        setSelected(null);
        setShowNext(false);
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
        setShowNext(false);
    };

    const speakQuestion = () => {
        const msg = new SpeechSynthesisUtterance(questions[current].question);
        msg.lang = 'vi-VN';
        window.speechSynthesis.speak(msg);
    };

    const fetchQuestions = async () => {
        const promises = [];
        for (let i = 1; i <= x; i++) {
            promises.push(
                fetch(`/questions/${i}.json`)
                    .then(response => response.json())
                    .then(data => data.sort(() => 0.5 - Math.random()).slice(0, y))
            );
        }
        const questions = await Promise.all(promises);
        return questions.flat();
    };

    useEffect(() => {
        if (!ready)
            fetchQuestions().then((data) => {
                setQuestions(data.sort(() => 0.5 - Math.random()).slice(0, 20));
                setReady(true);
            });
    }, []);

    return (
        <div style={{maxWidth: 800, margin: '0 auto', padding: 24}}>
            {!showResult && ready ? (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h2>Câu {current + 1}/20:</h2>
                        <button onClick={speakQuestion}>🔊 Đọc câu hỏi</button>
                    </div>

                    <p dangerouslySetInnerHTML={{__html: questions[current].question}}/>
                    {questions[current].diagram && <DrawDiagram diagram={questions[current].diagram}/>}
                    <div style={{marginTop: 20}}>
                        {questions[current].options.map((option, idx) => (
                            <button
                                key={idx}
                                style={{
                                    display: 'block',
                                    marginBottom: 10,
                                    padding: 10,
                                    backgroundColor: selected !== null && idx === questions[current].answer ? '#c8e6c9' : idx === selected ? '#ffcdd2' : ''
                                }}
                                disabled={selected !== null}
                                onClick={() => handleAnswer(idx)}
                            >
                                {String.fromCharCode(65 + idx)}. {option}
                            </button>
                        ))}
                    </div>
                    {questions[current].guide && (
                        <div>
                            <p><strong>Hướng dẫn:</strong></p>
                            <div dangerouslySetInnerHTML={{__html: questions[current].guide}}/>
                        </div>
                    )}
                    {selected !== null && (
                        <div style={{marginTop: 16}}>
                            <p><strong>Đáp án
                                đúng:</strong> {String.fromCharCode(65 + questions[current].answer)}. {questions[current].options[questions[current].answer]}
                            </p>
                            <button style={{marginTop: 16}} onClick={handleNext}>Câu tiếp theo</button>
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
