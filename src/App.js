import React, {Fragment, useEffect, useState} from "react";
import DrawDiagram from "./DrawDiagram";
import DrawBalance from "./DrawBalance";
import ReactDOMServer from 'react-dom/server';

export default function App() {
    const q1 = 1;
    const q2 = 15;
    const question_per_file = 2;
    const question_per_exercise = 20;
    const question_sort_random = true;

    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [ready, setReady] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showInfo, setShowInfo] = useState(() => {
        const saved = localStorage.getItem("showInfo");
        return saved ? JSON.parse(saved) : {
            name: true,
            guide: true,
            special: false,
            signal: false,
            suggest: false,
            multiChoice: true
        };
    });

    const [quizStarted, setQuizStarted] = useState(false);
    const [useTimer, setUseTimer] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 phút
    const [timeSpent, setTimeSpent] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);

    useEffect(() => {
        if (quizStarted && useTimer && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                setTimeSpent(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);
            return () => clearInterval(interval);
        }
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            setShowResult(true);
        }
    }, [
        quizStarted,
        useTimer,
        timeLeft
    ]);

    const renderSVG = (Component, props) => {
        try {
            return ReactDOMServer.renderToStaticMarkup(<Component {...props} />);
        } catch {
            return "";
        }
    };

    const printQuestion = (questions, showInfo) => {
        const printWindow = window.open("#", "_blank");
        const extraCount = [
            "name",
            "guide",
            "special",
            "signal",
            "suggest"
        ].filter(k => showInfo[k]).length;
        let perPage = 1;
        if (extraCount === 1 || extraCount === 0) perPage = 3;
        else if (extraCount === 2 || extraCount === 3) perPage = 2;

        const grouped = [];
        for (let i = 0; i < questions.length; i += perPage) {
            grouped.push(questions.slice(i, i + perPage));
        }

        const html = `<html lang="vi-VN">
      <head>
        <title>Ôn tập toán lớp 1</title>
        <style>
          body { font-family: Arial,sans-serif; padding: 24px; }
          .page { page-break-after: always; margin-bottom: 48px; }
          .question { margin: 20px 0}
          .question-item {  margin-left: 20px; }
          .options { margin-top: 8px; margin-left: 10px }
          .options div { margin-bottom: 4px; }
          h3 { margin-top: 0; }
        </style>
      </head>
      <body>
        ${grouped.map(group => `
          <div class="page">
            ${group.map((q, idx) => `
              <div class="question">
                <h3>Câu ${questions.indexOf(q) + 1}</h3>
                <div class="question-item">
                  <div>${q.question}</div>
                  ${q.diagram ? `${renderSVG(DrawDiagram, {diagram: q.diagram})}` : ""}
                  ${q.balance ? `${renderSVG(DrawBalance, {balance: q.balance})}` : ""}
                  ${showInfo.multiChoice ? `<div class="options">
                    ${q.options.map((opt, idx) => `<div>${String.fromCharCode(65 + idx)}. ${opt}</div>`).join("")}
                  </div>` : ""}
                  ${showInfo.guide ? `<p><strong>Hướng dẫn:</strong><br/>${q.guide}</p>` : ""}
                  ${showInfo.name ? `<p><strong>Dạng bài:</strong> ${q.name}</p>` : ""}
                  ${showInfo.special ? `<p><strong>Đặc điểm:</strong><ul>${q.special.map(s => `<li>${s}</li>`).join("")}</ul></p>` : ""}
                  ${showInfo.signal ? `<p><strong>Dấu hiệu nhận biết:</strong><ul>${q.signal.map(s => `<li>${s}</li>`).join("")}</ul></p>` : ""}
                  ${showInfo.suggest ? `<p><strong>Gợi ý:</strong><br/>${q.suggest}</p>` : ""}
                </div>
              </div>
              ${idx < group.length - 1 ? '<hr/>' : ''}
            `).join("")}
          </div>
        `).join("")}
        <script>
        const imgs = document.images;
        let loaded = 0;
        if (imgs.length === 0){
          window.print()
          setTimeout(() => {
            window.close()
          }, 100)
        } else {
            for (let i = 0; i < imgs.length; i++) {
              imgs[i].onload = () => {
                loaded++;
                  if (loaded === imgs.length) {
                    setTimeout(() => {
                      window.print()
                      window.close()
                  }, 100)
                }
              };
            }
        }
        </script>
      </body>
    </html>`;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    };

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
        setQuizStarted(false);
        setTimeLeft(20 * 60);
        setTimeSpent(0);
        if (timerInterval) clearInterval(timerInterval);
    };

    const fetchQuestions = async () => {
        const promises = [];
        for (let i = q1; i <= q2; i++) {
            promises.push(
                fetch(`/react-on-tap-toan-lop-1/questions/${i}.json`)
                    .then(response => response.json())
                    .then((result) => {
                        let data
                        if (question_sort_random) {
                            data = result.data.sort(() => 0.5 - Math.random()).slice(0, question_per_file);
                        } else {
                            data = result.data.slice(0, question_per_file);
                        }
                        data = data.map(item => ({
                            ...item,
                            name: result.name,
                            type: result.type,
                            special: result.special,
                            signal: result.signal,
                            suggest: result.suggest
                        }));
                        return data;
                    })
            );
        }
        const questions = await Promise.all(promises);
        if (question_sort_random) {
            return questions.flat().sort(() => 0.5 - Math.random()).slice(0, question_per_exercise);
        } else {
            return questions.flat().slice(0, question_per_exercise);
        }
    };

    useEffect(() => {
        if (!ready)
            fetchQuestions().then((data) => {
                setQuestions(data);
                setReady(true);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem("showInfo", JSON.stringify(showInfo));
    }, [showInfo]);

    const questionCounts = questions.reduce((acc, q) => {
        acc[q.name] = (acc[q.name] || 0) + 1;
        return acc;
    }, {});

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    return (
        <div style={{maxWidth: 800, margin: '0 auto', padding: 24}}>
            {!quizStarted && ready && (
                <div>
                    <h2>📚 Thông tin bộ đề</h2>
                    <p>Tổng số câu hỏi: <b>{questions.length} câu</b></p>
                    <ul>
                        {Object.entries(questionCounts).map(([name, count]) => (
                            <li key={name}>{name}: <b>{count} câu</b></li>
                        ))}
                    </ul>
                    <div>
                        <label><input type="checkbox" checked={showInfo.name}
                                      onChange={() => setShowInfo(prev => ({...prev, name: !prev.name}))}/> Hiện tên
                            dạng bài</label><br/>
                        <label><input type="checkbox" checked={showInfo.guide}
                                      onChange={() => setShowInfo(prev => ({...prev, guide: !prev.guide}))}/> Hiện hướng
                            dẫn</label><br/>
                        <label><input type="checkbox" checked={showInfo.special}
                                      onChange={() => setShowInfo(prev => ({...prev, special: !prev.special}))}/> Hiện
                            đặc điểm</label><br/>
                        <label><input type="checkbox" checked={showInfo.signal}
                                      onChange={() => setShowInfo(prev => ({...prev, signal: !prev.signal}))}/> Hiện dấu
                            hiệu</label><br/>
                        <label><input type="checkbox" checked={showInfo.suggest}
                                      onChange={() => setShowInfo(prev => ({...prev, suggest: !prev.suggest}))}/> Hiện
                            gợi ý</label><br/>
                        <label><input type="checkbox" checked={showInfo.multiChoice}
                                      onChange={() => setShowInfo(prev => ({
                                          ...prev,
                                          multiChoice: !prev.multiChoice
                                      }))}/> Trắc
                            nghiệm</label><br/>
                        <label><input type="checkbox" checked={useTimer}
                                      onChange={(e) => setUseTimer(e.target.checked)}/> Bấm giờ </label>
                        {useTimer && (
                            <Fragment><input
                                type="number"
                                defaultValue={20}
                                onBlur={(e) => setTimeLeft(Number(e.target.value) * 60)}
                                style={{marginLeft: 10, width: 60}}
                            /> phút</Fragment>
                        )}
                    </div>
                    <div className="mt-4">
                        <button className="btn btn-success mr-2" onClick={() => setQuizStarted(true)}>🚀 Bắt đầu làm
                            bài
                        </button>
                        <button className="btn btn-secondary" onClick={() => printQuestion(questions, showInfo)}>🖨️ In
                            bài ra giấy
                        </button>
                    </div>
                </div>
            )}

            {quizStarted && !showResult && ready && (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h2>Câu {current + 1}/{question_per_exercise}:</h2>
                        {useTimer &&
                            <h3 style={{color: timeLeft < 30 ? 'red' : undefined}}>⏱️ {formatTime(timeLeft)}</h3>}
                    </div>

                    <p dangerouslySetInnerHTML={{__html: questions[current].question}}/>
                    {questions[current].diagram && <DrawDiagram diagram={questions[current].diagram}/>}
                    {questions[current].balance && <DrawBalance balance={questions[current].balance}/>}
                    {showInfo.multiChoice && (
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
                    )}
                    {selected !== null && (
                        <Fragment>
                            <hr/>
                            <div className="mt-4">
                                <p><strong>Đáp án
                                    đúng:</strong> {String.fromCharCode(65 + questions[current].answer)}. {questions[current].options[questions[current].answer]}
                                </p>
                                <button className="btn btn-primary mt-4" onClick={handleNext}>Câu tiếp theo</button>
                            </div>
                        </Fragment>
                    )}
                    <hr/>
                    <div className='guide'>
                        <div className='mt-4'>
                            {showInfo.guide && <Fragment>
                                <p><strong>Hướng dẫn:</strong><br/>
                                    <span dangerouslySetInnerHTML={{__html: questions[current].guide}}/>
                                </p>
                            </Fragment>}
                            {showInfo.name && <p><strong>Dạng đề:</strong> {questions[current].name}</p>}
                            {showInfo.special && <div><strong>Đặc điểm trong bài:</strong>
                                <ul>
                                    {questions[current].special.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>}
                            {showInfo.signal && <div><strong>Dấu hiệu nhận biết:</strong>
                                <ul>
                                    {questions[current].signal.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>}
                            {showInfo.suggest && <div><strong>Gợi ý:</strong>
                                <div dangerouslySetInnerHTML={{__html: questions[current].suggest}}/>
                            </div>}
                        </div>
                    </div>
                </Fragment>
            )}

            {showResult && (
                <div style={{textAlign: 'center'}}>
                    <h2>🎉 Tổng kết</h2>
                    <p>Con đã trả lời đúng {score} / {questions.length} câu hỏi.</p>
                    {useTimer && <p>⏱️ Thời gian đã làm: {formatTime(timeSpent)}</p>}
                    {score === 20 && <p>🏆 Con thật tuyệt vời! Đạt điểm tối đa!</p>}
                    {score >= 10 && score < 20 && <p>👍 Con đã làm rất tốt! Cố thêm chút nữa nhé!</p>}
                    {score < 10 && <p>💪 Không sao cả, mình cùng ôn lại và chơi lại nhé!</p>}
                    <button onClick={handleRestart}>Chơi lại</button>
                </div>
            )}
        </div>
    );
}
