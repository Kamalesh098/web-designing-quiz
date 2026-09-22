import { useCallback, useEffect, useMemo, useRef, useState } from "react";



import { supabase } from "./supabase";



import "./styles.css";







const ADMIN_PIN = "XYF26";



const ROUND_1_TIME = 15 * 60;



const ROUND_2_TIME = 30 * 60;

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_PERMUTATIONS = (() => {
  const result = [];
  const build = (prefix, remaining) => {
    if (!remaining.length) { result.push(prefix); return; }
    remaining.forEach((value, index) => build([...prefix, value], [...remaining.slice(0, index), ...remaining.slice(index + 1)]));
  };
  build([], [0, 1, 2, 3]);
  return result;
})();
function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}
function buildTeamQuestionOptions(question, teamId, previousOrder) {
  const base = [
    { original: "A", text: question.option_a },
    { original: "B", text: question.option_b },
    { original: "C", text: question.option_c },
    { original: "D", text: question.option_d },
  ];
  const candidates = previousOrder ? OPTION_PERMUTATIONS.filter((perm) => perm.every((baseIndex, position) => base[baseIndex].original !== previousOrder[position])) : OPTION_PERMUTATIONS;
  const pool = candidates.length ? candidates : OPTION_PERMUTATIONS;
  const chosen = pool[hashSeed(`${teamId || "team"}:${question.id}`) % pool.length];
  return { ...question, displayOptions: chosen.map((baseIndex, position) => ({ letter: OPTION_LABELS[position], original: base[baseIndex].original, text: base[baseIndex].text })), displayOrder: chosen.map((baseIndex) => base[baseIndex].original) };
}
function buildTeamQuestions(data, teamId) {
  let previousOrder = null;
  return data.map((question) => { const built = buildTeamQuestionOptions(question, teamId, previousOrder); previousOrder = built.displayOrder; return built; });
}







/* =====================================================



   APP



===================================================== */







function App() {



  const [page, setPage] = useState("home");



  const [team, setTeam] = useState(null);







  return (



    <div>



      <header className="header">



        <div className="logo">WEB DESIGNING</div>







        <div className="header-right">



          <span>TEAM QUIZ</span>



        </div>



      </header>







      {page === "home" && <Home setPage={setPage} />}







      {page === "join" && (



        <JoinTeam



          setPage={setPage}



          setTeam={setTeam}



        />



      )}







      {page === "waiting" && (



        <WaitingRoom



          team={team}



          setPage={setPage}



        />



      )}







      {page === "round1" && (



        <Round1Quiz



          team={team}



          setPage={setPage}



          setTeam={setTeam}



        />



      )}







      {page === "round2" && (



        <Round2Page



          team={team}



          setPage={setPage}



        />



      )}







      {page === "admin" && <AdminPanel />}



    </div>



  );



}







/* =====================================================



   HOME



===================================================== */







function Home({ setPage }) {



  return (



    <main className="home">



      <div className="badge">



        COLLEGE EVENT • TEAM QUIZ



      </div>







      <h1>



        WEB



        <br />



        DESIGNING



        <br />



        <span>QUIZ</span>



      </h1>







      <p className="description">



        Think fast. Design smart. Compete as a team.



      </p>







      <div className="home-buttons">



        <button



          className="primary-btn"



          onClick={() => setPage("join")}



        >



          Join Quiz →



        </button>







        <button



          className="secondary-btn"



          onClick={() => setPage("admin")}



        >



          Admin



        </button>



      </div>







      <div className="round-info">



        <div>



          <strong>ROUND 01</strong>



          <span>30 Questions</span>



          <small>15 Minutes</small>



        </div>







        <div>



          <strong>ROUND 02</strong>



          <span>UI Challenge</span>



          <small>30 Minutes</small>



        </div>







        <div>



          <strong>SCORING</strong>



          <span>No Negative</span>



          <small>1 Mark / Correct</small>



        </div>



      </div>



    </main>



  );



}







/* =====================================================



   JOIN TEAM



===================================================== */







function JoinTeam({ setPage, setTeam }) {



  const [teamName, setTeamName] = useState("");



  const [members, setMembers] = useState("");

  const [collegeName, setCollegeName] = useState("");



  const [loading, setLoading] = useState(false);







  const joinTeam = async () => {



    if (!teamName.trim()) {



      alert("Team name enter pannunga");



      return;



    }







    

  if (!members.trim()) {

    alert("Team member name enter pannunga");

    return;

  }

  if (!collegeName.trim()) {

    alert("College name enter pannunga");

    return;

  }

setLoading(true);







    const { data, error } = await supabase



      .from("teams")



      .insert({



        name: teamName.trim(),



        members: members.trim(),

        college_name: collegeName.trim(),



      })



      .select()



      .single();







    setLoading(false);







    if (error) {



      console.error(error);







      if (error.code === "23505") {



        alert("இந்த team name already registered!");



      } else {



        alert(error.message);



      }







      return;



    }







    setTeam(data);



    setPage("waiting");



  };







  return (



    <main className="join-page">



      <div className="join-card">



        <div className="badge">



          TEAM REGISTRATION



        </div>







        <h2>Join the Quiz</h2>







        <p>



          Register your team before the admin starts Round 1.



        </p>







        <label>Team Name</label>







        <input



          type="text"



          placeholder="Example: Code Warriors"



          value={teamName}



          onChange={(e) =>



            setTeamName(e.target.value)



          }



        />







        <label>Team Members</label>







        <input



          type="text"



          placeholder="Kavi, Arun, Bala"



          value={members}



          onChange={(e) =>



            setMembers(e.target.value)



          }



        />







                <label>College Name</label>



        <input



          type="text"



          placeholder="Example: Salem College of Engineering and Technology"



          value={collegeName}



          onChange={(e) =>



            setCollegeName(e.target.value)



          }



        />



<button



          className="primary-btn full"



          onClick={joinTeam}



          disabled={loading}



        >



          {loading



            ? "Registering..."



            : "Register Team →"}



        </button>







        <button



          className="secondary-btn full"



          onClick={() => setPage("home")}



        >



          ← Back



        </button>



      </div>



    </main>



  );



}







/* =====================================================



   WAITING ROOM



===================================================== */







function WaitingRoom({ team, setPage }) {



  const [eventStatus, setEventStatus] = useState("WAITING");



  const [loading, setLoading] = useState(true);



  const [qualified, setQualified] = useState(null);







  const checkQualification = useCallback(async () => {



    if (!team?.id) return;



    const { data } = await supabase



      .from("round_qualifications")



      .select("qualified")



      .eq("team_id", team.id)



      .eq("round", 2)



      .maybeSingle();



    setQualified(data ? !!data.qualified : null);



  }, [team?.id]);







  useEffect(() => {



    let channel;



    const getEventStatus = async () => {



      const { data, error } = await supabase



        .from("event_state")



        .select("status, round")



        .eq("id", 1)



        .single();



      if (!error && data) setEventStatus(data.status);



      await checkQualification();



      setLoading(false);



    };



    getEventStatus();



    channel = supabase



      .channel("event-status-live")



      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "event_state", filter: "id=eq.1" }, async (payload) => {



        setEventStatus(payload.new.status);



        await checkQualification();



      })



      .subscribe();



    const interval = setInterval(checkQualification, 3000);



    return () => {



      clearInterval(interval);



      if (channel) supabase.removeChannel(channel);



    };



  }, [checkQualification]);







  const enterRound2 = async () => {



    const { data } = await supabase



      .from("round_qualifications")



      .select("qualified")



      .eq("team_id", team.id)



      .eq("round", 2)



      .maybeSingle();



    if (!data?.qualified) {



      alert("Your team is not qualified for Round 2.");



      setQualified(false);



      return;



    }



    setPage("round2");



  };







  return (



    <main className="join-page">



      <div className="join-card waiting-card">



        <div className="badge">TEAM READY</div>



        <div className="waiting-icon">●</div>



        <h2>{team?.name}</h2>



        <p>Team successfully registered.<br />Wait for the admin to start the round.</p>



        <div className="status-box">



          <span>EVENT STATUS</span>



          <strong>{loading ? "CHECKING..." : eventStatus}</strong>



        </div>







        {eventStatus === "ROUND_1" && (



          <button className="primary-btn full" onClick={() => setPage("round1")}>🚀 Enter Round 1</button>



        )}







        {eventStatus === "ROUND_2" && qualified === true && (



          <button className="primary-btn full" onClick={enterRound2}>🎨 Enter Round 2</button>



        )}







        {eventStatus === "ROUND_2" && qualified === false && (



          <div className="waiting-message"><span>Round 2 is active, but your team was not qualified.</span></div>



        )}







        {eventStatus === "ROUND_2" && qualified === null && (



          <div className="waiting-message"><div className="pulse-dot"></div><span>Checking qualification...</span></div>



        )}







        {eventStatus === "WAITING" && (



          <div className="waiting-message"><div className="pulse-dot"></div><span>Waiting for Admin...</span></div>



        )}



      </div>



    </main>



  );



}







/* =====================================================



   ROUND 1 QUIZ



===================================================== */







function Round1Quiz({ team, setPage, setTeam }) {



  const [questions, setQuestions] =



    useState([]);







  const [answers, setAnswers] =



    useState({});







  const [answeredQuestions, setAnsweredQuestions] =



    useState({});







  const [currentQuestion, setCurrentQuestion] =



    useState(0);







  const [timeLeft, setTimeLeft] =



    useState(ROUND_1_TIME);







  const [loading, setLoading] =



    useState(true);







  const [submitted, setSubmitted] =



    useState(false);







  const [score, setScore] =



    useState(0);







  const [rank, setRank] =



    useState(null);







  const [securityTerminated, setSecurityTerminated] = useState(false);



  const securityTriggeredRef = useRef(false);







  useEffect(() => {



    if (loading || submitted) return;



    const terminateQuiz = () => {



      if (securityTriggeredRef.current) return;



      securityTriggeredRef.current = true;



      setSecurityTerminated(true);



    };



    const onVisibility = () => {



      if (document.visibilityState === "hidden") terminateQuiz();



    };



    const onBlur = () => terminateQuiz();



    document.addEventListener("visibilitychange", onVisibility);



    window.addEventListener("blur", onBlur);



    return () => {



      document.removeEventListener("visibilitychange", onVisibility);



      window.removeEventListener("blur", onBlur);



    };



  }, [loading, submitted]);







  useEffect(() => {



    if (!securityTerminated) return;



    setTeam(null);



    setPage("home");



  }, [securityTerminated, setPage, setTeam]);







  /* =================================================



     LOAD QUESTIONS



  ================================================= */







  useEffect(() => {



    let active = true;







    const loadQuestions = async () => {



      const { data, error } = await supabase



        .from("questions")



        .select(



          "id, question_order, question_text, option_a, option_b, option_c, option_d, correct_option"



        )



        .eq("round", 1)



        .order("question_order", {



          ascending: true,



        });







      if (!active) return;







      if (error) {



        console.error(error);







        alert(



          "Questions load panna mudiyala: " +



            error.message



        );







        setLoading(false);



        return;



      }







      setQuestions(buildTeamQuestions(data || [], team?.id));



      setLoading(false);



    };







    loadQuestions();







    return () => {



      active = false;



    };



  }, []);







  /* =================================================



     CALCULATE PARTICIPANT RANK



  ================================================= */







  const updateRank = useCallback(



    async (currentScore) => {



      if (!team?.id) return;







      const { data, error } = await supabase



        .from("round_scores")



        .select(



          "team_id, score, updated_at"



        )



        .eq("round", 1);







      if (error) {



        console.error(



          "Rank update error:",



          error



        );



        return;



      }







      const rows = data || [];







      /*



        Rank:



        1. Higher score first



        2. If same score, team_id stable tie-break



      */







      const sorted = [...rows].sort(



        (a, b) => {



          if (b.score !== a.score) {



            return b.score - a.score;



          }







          return String(a.team_id).localeCompare(



            String(b.team_id)



          );



        }



      );







      const position =



        sorted.findIndex(



          (item) =>



            item.team_id === team.id



        ) + 1;







      if (position > 0) {



        setRank(position);



      } else {



        /*



          Team may not yet appear immediately



          in the query after first score save.



        */







        const betterTeams =



          rows.filter(



            (item) =>



              item.score > currentScore



          ).length;







        setRank(betterTeams + 1);



      }



    },



    [team?.id]



  );







  /* =================================================



     LOAD INITIAL SCORE + LIVE SCORE



  ================================================= */







  useEffect(() => {



    if (!team?.id) return;







    let active = true;







    const loadScore = async () => {



      const { data, error } = await supabase



        .from("round_scores")



        .select(



          "score, updated_at"



        )



        .eq("team_id", team.id)



        .eq("round", 1)



        .maybeSingle();







      if (!active) return;







      if (error) {



        console.error(



          "Score load error:",



          error



        );



        return;



      }







      const currentScore =



        data?.score || 0;







      setScore(currentScore);







      await updateRank(currentScore);



    };







    loadScore();







    const channel = supabase



      .channel(



        `participant-score-${team.id}`



      )



      .on(



        "postgres_changes",



        {



          event: "*",



          schema: "public",



          table: "round_scores",



          filter: `team_id=eq.${team.id}`,



        },



        async (payload) => {



          if (!active) return;







          const newScore =



            payload.new?.score ?? 0;







          setScore(newScore);







          await updateRank(newScore);



        }



      )



      .subscribe();







    /*



      Small fallback sync.



      This guarantees live update even if



      realtime delivery is delayed.



    */







    const interval = setInterval(



      async () => {



        if (!active) return;







        const { data } = await supabase



          .from("round_scores")



          .select("score")



          .eq("team_id", team.id)



          .eq("round", 1)



          .maybeSingle();







        if (!active) return;







        const newScore =



          data?.score || 0;







        setScore(newScore);







        await updateRank(newScore);



      },



      1000



    );







    return () => {



      active = false;







      clearInterval(interval);







      supabase.removeChannel(channel);



    };



  }, [team?.id, updateRank]);







  /* =================================================



     TIMER



  ================================================= */







  const submitQuiz = useCallback(



    async (finalScore = score) => {



      if (submitted) return;







      setSubmitted(true);







      if (!team?.id) return;







      const { error } = await supabase



        .from("round_scores")



        .upsert(



          {



            team_id: team.id,



            round: 1,



            score: finalScore,



            updated_at:



              new Date().toISOString(),



          },



          {



            onConflict:



              "team_id,round",



          }



        );







      if (error) {



        console.error(



          "Final score save error:",



          error



        );



      }







      await updateRank(finalScore);



    },



    [



      score,



      submitted,



      team?.id,



      updateRank,



    ]



  );







  useEffect(() => {



    if (



      loading ||



      submitted



    ) {



      return;



    }







    if (timeLeft <= 0) {



      submitQuiz(score);



      return;



    }







    const timer = setInterval(() => {



      setTimeLeft(



        (previous) =>



          previous > 0



            ? previous - 1



            : 0



      );



    }, 1000);







    return () =>



      clearInterval(timer);



  }, [



    timeLeft,



    loading,



    submitted,



    submitQuiz,



    score,



  ]);







  /* =================================================



     FORMAT TIMER



  ================================================= */







  const formatTime = (seconds) => {



    const minutes =



      Math.floor(seconds / 60);







    const secs =



      seconds % 60;







    return `${String(minutes).padStart(



      2,



      "0"



    )}:${String(secs).padStart(



      2,



      "0"



    )}`;



  };







  /* =================================================



     SAVE LIVE SCORE



  ================================================= */







  const saveScore = async (newScore) => {



    if (!team?.id) return;







    const { error } = await supabase



      .from("round_scores")



      .upsert(



        {



          team_id: team.id,



          round: 1,



          score: newScore,



          updated_at:



            new Date().toISOString(),



        },



        {



          onConflict:



            "team_id,round",



        }



      );







    if (error) {



      console.error(



        "Live score save error:",



        error



      );



    }



  };







  /* =================================================



     SELECT ANSWER



  ================================================= */







  const selectAnswer = async (option) => {



    const question =



      questions[currentQuestion];







    if (!question) return;







    /*



      Already answered?



      Don't allow changing answer.



    */







    if (



      answeredQuestions[



        question.id



      ]



    ) {



      return;



    }







    const selectedOption = question.displayOptions?.find((item) => item.letter === option);

    if (!selectedOption) return;

    const isCorrect = selectedOption.original === question.correct_option;







    const newScore =



      isCorrect



        ? score + 1



        : score;







    /*



      Store selected answer



    */







    setAnswers(



      (previous) => ({



        ...previous,



        [question.id]:



          option,



      })



    );







    /*



      Lock question



    */







    setAnsweredQuestions(



      (previous) => ({



        ...previous,



        [question.id]:



          true,



      })



    );







    /*



      Immediately update local UI



    */







    setScore(newScore);







    /*



      Immediately save to Supabase



      -> Admin sees it live



    */







    await saveScore(newScore);







    /*



      Immediately calculate rank



    */







    await updateRank(newScore);



  };







  /* =================================================



     NEXT QUESTION



  ================================================= */







  const nextQuestion = () => {



    if (



      currentQuestion <



      questions.length - 1



    ) {



      setCurrentQuestion(



        (previous) =>



          previous + 1



      );



    } else {



      submitQuiz(score);



    }



  };







  /* =================================================



     PREVIOUS QUESTION



  ================================================= */







  const previousQuestion = () => {



    if (currentQuestion > 0) {



      setCurrentQuestion(



        (previous) =>



          previous - 1



      );



    }



  };







  /* =================================================



     LOADING



  ================================================= */







  if (loading) {



    return (



      <main className="round-page">



        <div className="round-card">



          <div className="round-number">



            ROUND 01



          </div>







          <h2>LOADING...</h2>







          <p>



            Preparing your questions.



          </p>



        </div>



      </main>



    );



  }







  /* =================================================



     NO QUESTIONS



  ================================================= */







  if (questions.length === 0) {



    return (



      <main className="round-page">



        <div className="round-card">



          <div className="round-number">



            ROUND 01



          </div>







          <h2>



            NO QUESTIONS



          </h2>







          <p>



            Round 1 questions are not



            available.



          </p>



        </div>



      </main>



    );



  }







  /* =================================================



     SECURITY TERMINATION



  ================================================= */







  if (securityTerminated) {



    return (



      <main className="round-page">



        <div className="round-card">



          <div className="round-number">QUIZ TERMINATED</div>



          <h2>TAB / WINDOW SWITCH DETECTED</h2>



          <p>You left the quiz window. Your quiz session has been terminated automatically.</p>



          <div className="status-box"><span>SECURITY STATUS</span><strong>DISQUALIFIED</strong></div>



          <p>Returning to the home screen...</p>



        </div>



      </main>



    );



  }







  /* =================================================



     RESULT



  ================================================= */







  if (submitted) {



    return (



      <main className="round-page">



        <div className="round-card">







          <div className="round-number">



            ROUND 01 COMPLETED



          </div>







          <h2>



            {score} /{" "}



            {questions.length}



          </h2>







          <p>



            Your Round 1 score has



            been recorded.



          </p>







          <div className="live-score-box">







            <div>



              <div className="live-score-label">



                YOUR SCORE



              </div>







              <div className="live-score-value">



                {score}



              </div>



            </div>







            <div>



              <div className="live-score-label">



                POSITION



              </div>







              <div className="live-rank-value">



                #{rank || "-"}



              </div>



            </div>







          </div>







          <div className="status-box">



            <span>TEAM</span>







            <strong>



              {team?.name || "Team"}



            </strong>



          </div>







          <button



            className="primary-btn"



            onClick={() =>



              setPage("waiting")



            }



          >



            Back to Waiting Room



          </button>







        </div>



      </main>



    );



  }







  /* =================================================



     CURRENT QUESTION



  ================================================= */







  const question =



    questions[currentQuestion];







  const selectedAnswer =



    answers[question.id];







  const answered = answeredQuestions[question.id];

  const correctDisplayOption = question.displayOptions?.find(
    (item) => item.original === question.correct_option
  );

  const correctDisplayLetter =
    correctDisplayOption?.letter || question.correct_option;

  const progress =



    ((currentQuestion + 1) /



      questions.length) *



    100;







  return (



    <main className="quiz-page">







      {/* HEADER */}







      <div className="quiz-header">







        <div>



          <div className="round-number">



            ROUND 01



          </div>







          <h2>



            Web Designing



          </h2>



        </div>







        <div



          className={



            timeLeft <= 30



              ? "quiz-timer danger"



              : "quiz-timer"



          }



        >



          <span>



            TIME LEFT



          </span>







          <strong>



            {formatTime(timeLeft)}



          </strong>



        </div>







      </div>







      {/* LIVE SCORE */}







      <div className="live-score-box">







        <div>



          <div className="live-score-label">



            LIVE SCORE



          </div>







          <div className="live-score-value">



            {score}



          </div>



        </div>







        <div>



          <div className="live-score-label">



            LIVE POSITION



          </div>







          <div className="live-rank-value">



            #{rank || "-"}



          </div>



        </div>







      </div>







      {/* PROGRESS */}







      <div className="quiz-progress">







        <div className="progress-info">



          <span>



            Question{" "}



            {currentQuestion + 1}{" "}



            of{" "}



            {questions.length}



          </span>







          <span>



            {Math.round(progress)}%



          </span>



        </div>







        <div className="progress-track">



          <div



            className="progress-fill"



            style={{



              width: `${progress}%`,



            }}



          />



        </div>







      </div>







      {/* QUESTION */}







      <div className="question-card">







        <div className="question-number">



          QUESTION{" "}



          {String(



            currentQuestion + 1



          ).padStart(2, "0")}



        </div>







        <h1>



          {question.question_text}



        </h1>







        <div className="options-grid">







          {(question.displayOptions || []).map(({ letter, text, original }) => {







              const isSelected =



                selectedAnswer ===



                letter;







              const isCorrect = question.correct_option === original;







              let optionClass =



                "quiz-option";







              /*



                AFTER ANSWER:







                Correct = GREEN







                Selected wrong = RED



              */







              if (answered) {







                if (isCorrect) {



                  optionClass +=



                    " option-correct";



                }







                if (



                  isSelected &&



                  !isCorrect



                ) {



                  optionClass +=



                    " option-wrong";



                }







                optionClass +=



                  " option-disabled";



              }







              return (



                <button



                  key={letter}



                  className={



                    optionClass



                  }



                  style={
                    answered
                      ? {
                          background: isCorrect ? "#16a34a" : isSelected ? "#dc2626" : undefined,
                          color: isCorrect || isSelected ? "#ffffff" : undefined,
                          borderColor: isCorrect ? "#15803d" : isSelected ? "#b91c1c" : undefined,
                        }
                      : undefined
                  }

                  disabled={



                    answered



                  }



                  onClick={() =>



                    selectAnswer(



                      letter



                    )



                  }



                >







                  <span className="option-letter">



                    {letter}



                  </span>







                  <span className="option-text">



                    {text}



                  </span>







                </button>



              );



            }



          )}







        </div>







        {/* FEEDBACK */}







        {answered && (



          <div



            className={



              selectedAnswer === correctDisplayLetter



                ? "answer-feedback correct"



                : "answer-feedback wrong"



            }



          >



            {selectedAnswer === correctDisplayLetter



              ? "✓ Correct Answer"
              : `✕ Wrong Answer — Correct Answer: ${correctDisplayLetter}`}



          </div>



        )}







        {/* CONTROLS */}







        <div className="quiz-controls">







          <button



            className="secondary-btn"



            onClick={



              previousQuestion



            }



            disabled={



              currentQuestion === 0



            }



          >



            ← Previous



          </button>







          <button



            className="primary-btn"



            onClick={nextQuestion}



          >



            {currentQuestion <



            questions.length - 1



              ? "Next →"



              : "Submit Quiz ✓"}



          </button>







        </div>







      </div>



    </main>



  );



}







/* =====================================================



   ROUND 2



===================================================== */







function Round2Page({ team, setPage }) {



  const [assignment, setAssignment] = useState(null);



  const [timeLeft, setTimeLeft] = useState(ROUND_2_TIME);



  const [loading, setLoading] = useState(true);



  const [submitted, setSubmitted] = useState(false);



  const [websiteUrl, setWebsiteUrl] = useState("");



  const [screenshotUrl, setScreenshotUrl] = useState("");



  const [saving, setSaving] = useState(false);



  const [startedAt, setStartedAt] = useState(null);







  const loadAssignment = useCallback(async () => {



    if (!team?.id) return;



    const { data: qualification } = await supabase



      .from("round_qualifications")



      .select("qualified")



      .eq("team_id", team.id)



      .eq("round", 2)



      .maybeSingle();







    if (!qualification?.qualified) {



      alert("Your team is not qualified for Round 2.");



      setPage("waiting");



      return;



    }







    const { data, error } = await supabase



      .from("round2_assignments")



      .select("id, challenge_id, assigned_at, round2_challenges(id, challenge_title, challenge_description)")



      .eq("team_id", team.id)



      .maybeSingle();







    if (error || !data) {



      console.error(error);



      alert("Round 2 challenge has not been assigned yet.");



      setPage("waiting");



      return;



    }







    const { data: eventState } = await supabase



      .from("event_state")



      .select("status, updated_at")



      .eq("id", 1)



      .single();







    if (eventState?.status !== "ROUND_2") {



      setPage("waiting");



      return;



    }







    setAssignment(data);



    // Round 2 timer starts when the admin starts Round 2,



    // not when the challenge was assigned.



    setStartedAt(eventState.updated_at || new Date().toISOString());







    const { data: submission } = await supabase



      .from("round2_submissions")



      .select("submission_url, screenshot_url, submitted_at")



      .eq("team_id", team.id)



      .maybeSingle();







    if (submission) {



      setWebsiteUrl(submission.submission_url || "");



      setScreenshotUrl(submission.screenshot_url || "");



      setSubmitted(true);



    }







    setLoading(false);



  }, [team?.id, setPage]);







  useEffect(() => { loadAssignment(); }, [loadAssignment]);







  useEffect(() => {



    if (!startedAt || submitted) return;



    const tick = () => {



      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);



      setTimeLeft(Math.max(0, ROUND_2_TIME - elapsed));



    };



    tick();



    const interval = setInterval(tick, 1000);



    return () => clearInterval(interval);



  }, [startedAt, submitted]);







  const submitChallenge = async (auto = false) => {



    if (submitted || saving) return;



    if (!auto && !websiteUrl.trim() && !screenshotUrl.trim()) {

      alert("Website URL or Screenshot URL submit pannunga.");

      return;

    }



    setSaving(true);



    const { error } = await supabase



      .from("round2_submissions")



      .upsert({



        team_id: team.id,



        submission_url: websiteUrl.trim() || null,



        screenshot_url: screenshotUrl.trim() || null,



        submitted_at: new Date().toISOString(),



      }, { onConflict: "team_id" });



    setSaving(false);



    if (error) {



      console.error(error);



      alert(error.message);



      return;



    }



    setSubmitted(true);



    alert(auto ? "Time over. Your submission has been saved." : "Round 2 submission saved!");



  };







  useEffect(() => {



    if (timeLeft === 0 && !submitted) submitChallenge(true);



  }, [timeLeft, submitted]);







  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;







  if (loading) return (



    <main className="round-page"><div className="round-card"><div className="round-number">ROUND 02</div><h2>LOADING CHALLENGE...</h2><p>Preparing your team challenge.</p></div></main>



  );







  if (!assignment?.round2_challenges) return null;







  const challenge = assignment.round2_challenges;







  return (



    <main className="round-page">



      <div className="round-card" style={{ maxWidth: 900, width: "100%" }}>



        <div className="round-number">ROUND 02 • UI DESIGN CHALLENGE</div>



        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>



          <div><h2>{challenge.challenge_title}</h2><p>Only your team can see this assigned challenge.</p></div>



          <div className={`quiz-timer ${timeLeft <= 60 ? "danger" : ""}`}><span>TIME LEFT</span><strong>{formatTime(timeLeft)}</strong></div>



        </div>







        <div className="question-card" style={{ marginTop: 20 }}>



          <div className="question-number">YOUR UNIQUE TASK</div>



          <h1 style={{ fontSize: "clamp(20px, 3vw, 32px)" }}>{challenge.challenge_description}</h1>



          <div className="status-box" style={{ marginTop: 20 }}><span>TIME LIMIT</span><strong>30:00</strong></div>



        </div>







        {!submitted ? (



          <div style={{ marginTop: 20 }}>



            <label>Website / Live URL</label>



            <input type="url" placeholder="https\\://..." value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />



            <label style={{ marginTop: 12, display: "block" }}>Screenshot URL (optional)</label>



            <input type="url" placeholder="https\\://..." value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} />



            <p style={{ fontSize: 12, opacity: .75, marginTop: 10 }}>You can build the website using your preferred editor/tool during the 30 minutes.</p>



            <button className="primary-btn full" onClick={() => submitChallenge(false)} disabled={saving || timeLeft === 0}>{saving ? "Submitting..." : "Submit Challenge ✓"}</button>



          </div>



        ) : (



          <div style={{ marginTop: 20 }}>



            <div className="status-box"><span>SUBMISSION STATUS</span><strong>SUBMITTED ✓</strong></div>



            <p style={{ marginTop: 12 }}>Your Round 2 submission has been recorded.</p>



          </div>



        )}



      </div>



    </main>



  );



}







/* =====================================================



   ADMIN PANEL



===================================================== */








function FinalResults({ team, setPage }) {
  const [round1Score, setRound1Score] = useState(null);
  const [judging, setJudging] = useState(null);
  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    if (!team?.id) return;

    const [
      { data: myR1 },
      { data: myJudging },
      { data: allTeams },
      { data: allR1 },
      { data: allJudging }
    ] = await Promise.all([
      supabase.from("round_scores").select("score").eq("team_id", team.id).eq("round", 1).maybeSingle(),
      supabase.from("round2_judging").select("*").eq("team_id", team.id).maybeSingle(),
      supabase.from("teams").select("id, name, members, college_name"),
      supabase.from("round_scores").select("team_id, score").eq("round", 1),
      supabase.from("round2_judging").select("team_id, total")
    ]);

    setRound1Score(myR1?.score ?? null);
    setJudging(myJudging || null);

    const r1Map = new Map((allR1 || []).map(x => [x.team_id, Number(x.score) || 0]));
    const r2Map = new Map((allJudging || []).map(x => [x.team_id, Number(x.total) || 0]));

    const rows = (allTeams || [])
      .filter(t => r2Map.has(t.id))
      .map(t => ({
        ...t,
        round1: r1Map.get(t.id) || 0,
        round2: r2Map.get(t.id) || 0,
        final: (r1Map.get(t.id) || 0) + (r2Map.get(t.id) || 0)
      }))
      .sort((a, b) => b.final - a.final || a.name.localeCompare(b.name));

    setRanked(rows);
    setLoading(false);
  }, [team?.id]);

  useEffect(() => {
    loadResults();

    const channel = supabase
      .channel(`final-results-${team?.id || "guest"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "round2_judging" },
        () => loadResults()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadResults, team?.id]);

  if (loading) {
    return (
      <main className="round-page">
        <div className="round-card">
          <div className="round-number">FINAL RESULT</div>
          <h2>LOADING RESULT...</h2>
        </div>
      </main>
    );
  }

  const finalTotal = (Number(round1Score) || 0) + (Number(judging?.total) || 0);

  return (
    <main className="round-page">
      <div className="round-card result-card">
        <div className="round-number">🏆 FINAL RESULT</div>
        <h2>{team?.name || "Your Team"}</h2>
        <p>{team?.college_name || "College not listed"}</p>

        {!judging ? (
          <div className="result-pending">
            <strong>RESULT PENDING</strong>
            <p>Admin has not published your Round 2 marks yet.</p>
            <button className="secondary-btn full" onClick={() => setPage("round2")}>
              ← BACK TO ROUND 2
            </button>
          </div>
        ) : (
          <>
            <div className="result-score-grid">
              <div>
                <span>ROUND 1</span>
                <strong>{round1Score ?? 0} / 30</strong>
              </div>
              <div>
                <span>ROUND 2</span>
                <strong>{judging.total} / 100</strong>
              </div>
              <div className="result-total">
                <span>FINAL SCORE</span>
                <strong>{finalTotal} / 130</strong>
              </div>
            </div>

            <div className="judging-breakdown">
              <h3>Round 2 Evaluation</h3>
              <div><span>UI Design</span><b>{judging.ui_design} / 20</b></div>
              <div><span>Creativity</span><b>{judging.creativity} / 20</b></div>
              <div><span>Usability</span><b>{judging.usability} / 20</b></div>
              <div><span>Responsiveness</span><b>{judging.responsiveness} / 20</b></div>
              <div><span>Overall Execution</span><b>{judging.overall_execution} / 20</b></div>
            </div>

            <div className="final-ranking">
              <h3>Final Results</h3>
              {ranked.map((row, i) => (
                <div className={`final-rank-row ${row.id === team?.id ? "current-team" : ""}`} key={row.id}>
                  <span>#{i + 1}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.college_name || "College not listed"}</small>
                  </div>
                  <b>{row.final} / 130</b>
                </div>
              ))}
            </div>

            <button className="secondary-btn full" onClick={() => setPage("round2")}>
              ← BACK TO ROUND 2
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function AdminPanel() {



  const [loggedIn, setLoggedIn] =



    useState(false);







  const [pin, setPin] =



    useState("");







  const [status, setStatus] =



    useState("WAITING");







  const [teams, setTeams] =



    useState([]);







  const [loading, setLoading] =



    useState(false);







  const [topN, setTopN] = useState(1);



  const [qualificationConfirmed, setQualificationConfirmed] = useState(false);



  const [qualifiedTeams, setQualifiedTeams] = useState([]);



  const [challengeText, setChallengeText] = useState(



    "College Event Registration Website\nOnline Food Ordering Website\nHospital Appointment Website\nE-Learning Dashboard\nTravel Booking Website\nJob Portal Landing Page\nCollege Club Management Website\nMovie Ticket Booking Website\nFitness Tracker Dashboard\nAI Product Landing Page"



  );



  const [assignments, setAssignments] = useState([]);
  const [round2Submissions, setRound2Submissions] = useState([]);
  const [judgingScores, setJudgingScores] = useState({});







  const login = () => {



    if (pin === ADMIN_PIN) {



      setLoggedIn(true);



    } else {



      alert("Wrong Admin PIN");



    }



  };







  /* =================================================



     LOAD TEAMS + STATUS



  ================================================= */







  const loadData = useCallback(



    async () => {



      const event =



        await supabase



          .from("event_state")



          .select("*")



          .eq("id", 1)



          .single();







      if (event.data) {



        setStatus(



          event.data.status



        );



      }







      const teamData =



        await supabase



          .from("teams")



          .select("*")



          .order(



            "created_at",



            {



              ascending: true,



            }



          );







      if (teamData.data) {



        setTeams(



          teamData.data



        );



      }



    },



    []



  );







  const loadQualificationData = useCallback(async () => {



    const { data: q } = await supabase



      .from("round_qualifications")



      .select("team_id, qualified")



      .eq("round", 2);



    const qualifiedIds = new Set((q || []).filter(x => x.qualified).map(x => x.team_id));



    setQualifiedTeams(teams.filter(t => qualifiedIds.has(t.id)));



    const { data: a } = await supabase



      .from("round2_assignments")



      .select("team_id, challenge_id, round2_challenges(id, challenge_title, challenge_description)");



    setAssignments(a || []);

    const { data: submissions } = await supabase
      .from("round2_submissions")
      .select("team_id, submission_url, screenshot_url, submitted_at")
      .order("submitted_at", { ascending: true });

    const { data: judged } = await supabase
      .from("round2_judging")
      .select("*");

    const scoreState = {};
    (judged || []).forEach(row => {
      scoreState[row.team_id] = {
        ui_design: row.ui_design,
        creativity: row.creativity,
        usability: row.usability,
        responsiveness: row.responsiveness,
        overall_execution: row.overall_execution,
        total: row.total
      };
    });

    setRound2Submissions(submissions || []);
    // Do not wipe marks that the admin is currently typing.
    // Keep existing unsaved draft values and only fill fields that are not already present.
    setJudgingScores(prev => {
      const merged = { ...scoreState };
      Object.entries(prev || {}).forEach(([teamId, draft]) => {
        if (!draft) return;
        merged[teamId] = { ...(merged[teamId] || {}), ...draft };
      });
      return merged;
    });



  }, [teams]);







  useEffect(() => {



    if (!loggedIn) return;



    loadQualificationData();



  }, [loggedIn, loadQualificationData]);







  /* =================================================



     ROUND 1 QUALIFICATION



  ================================================= */







  const confirmQualification = async () => {



    const count = Number(topN);



    if (!Number.isInteger(count) || count < 1) {



      alert("Valid Top N enter pannunga.");



      return;



    }







    const { data: scoreRows, error } = await supabase



      .from("round_scores")



      .select("team_id, score, updated_at")



      .eq("round", 1);



    if (error) { alert(error.message); return; }







    const teamMap = new Map(teams.map(t => [t.id, t]));



    const ranked = (scoreRows || []).map(r => ({ ...r, name: teamMap.get(r.team_id)?.name || "Unknown Team" }))



      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));







    const selected = ranked.slice(0, Math.min(count, ranked.length));



    if (selected.length < count) {



      alert(`Only ${selected.length} teams have Round 1 scores.`);



      return;



    }







    setLoading(true);



    await supabase.from("round_qualifications").delete().eq("round", 2);



    const { error: insertError } = await supabase.from("round_qualifications").insert(



      selected.map(x => ({ team_id: x.team_id, round: 2, qualified: true }))



    );



    setLoading(false);



    if (insertError) { alert(insertError.message); return; }







    setQualifiedTeams(selected.map(x => teamMap.get(x.team_id)).filter(Boolean));



    setQualificationConfirmed(true);



    alert(`${selected.length} teams qualified for Round 2.`);



  };







  const createAndAssignChallenges = async () => {



    if (!qualificationConfirmed || qualifiedTeams.length === 0) {



      alert("First confirm Round 2 qualification.");



      return;



    }



    const challenges = challengeText.split("\n").map(x => x.trim()).filter(Boolean);



    if (challenges.length < qualifiedTeams.length) {



      alert(`At least ${qualifiedTeams.length} different challenges required.`);



      return;



    }







    setLoading(true);



    await supabase.from("round2_assignments").delete().in("team_id", qualifiedTeams.map(t => t.id));







    const { data: created, error: challengeError } = await supabase



      .from("round2_challenges")



      .insert(challenges.slice(0, qualifiedTeams.length).map((title, i) => ({



        challenge_title: title,



        challenge_description: `Create a professional, responsive website UI for: ${title}. Focus on visual hierarchy, creativity, usability, spacing, typography, and responsive layout.`,



      })))



      .select();



    if (challengeError) { setLoading(false); alert(challengeError.message); return; }







    const rows = qualifiedTeams.map((t, i) => ({ team_id: t.id, challenge_id: created[i].id }));



    const { error: assignmentError } = await supabase.from("round2_assignments").insert(rows);



    setLoading(false);



    if (assignmentError) { alert(assignmentError.message); return; }







    await loadQualificationData();



    alert("Unique Round 2 challenges assigned to every qualified team!");



  };







  
  const updateJudgingField = (teamId, field, value) => {
    // Keep the raw text while typing so React never replaces the input with an
    // empty/parsed value on each keystroke. Validation happens when saving.
    if (value !== "" && !/^\d{0,2}$/.test(value)) return;

    setJudgingScores(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [field]: value
      }
    }));
  };

  const saveJudging = async (teamId) => {
    const score = judgingScores[teamId] || {};
    const fields = ["ui_design", "creativity", "usability", "responsiveness", "overall_execution"];
    const values = {};

    for (const field of fields) {
      const n = Number(score[field]);
      if (!Number.isInteger(n) || n < 0 || n > 20) {
        alert("Each Round 2 mark must be between 0 and 20.");
        return;
      }
      values[field] = n;
    }

    const total = fields.reduce((sum, field) => sum + values[field], 0);

    const { error } = await supabase
      .from("round2_judging")
      .upsert({
        team_id: teamId,
        ...values,
        total,
        updated_at: new Date().toISOString()
      }, { onConflict: "team_id" });

    if (error) {
      alert(error.message);
      return;
    }

    setJudgingScores(prev => ({
      ...prev,
      [teamId]: { ...values, total }
    }));

    alert("Round 2 marks saved successfully.");
  };

/* =================================================



     LIVE TEAM UPDATES



  ================================================= */







  useEffect(() => {



    if (!loggedIn) return;







    loadData();







    const teamChannel =



      supabase



        .channel(



          "admin-teams-live"



        )



        .on(



          "postgres_changes",



          {



            event: "*",



            schema: "public",



            table: "teams",



          },



          () => {



            loadData();



          }



        )



        .subscribe();







    /*



      Backup team sync



    */







    const interval =



      setInterval(



        loadData,



        3000



      );







    return () => {



      clearInterval(



        interval



      );







      supabase.removeChannel(



        teamChannel



      );



    };



  }, [



    loggedIn,



    loadData,



  ]);







  /* =================================================



     DELETE TEAM



  ================================================= */







  const deleteTeam = async (



    teamId,



    teamName



  ) => {



    const confirmed =



      window.confirm(



        `Delete "${teamName}"?\n\nThis team will be removed from the registered teams list.`



      );







    if (!confirmed) return;







    const { error } =



      await supabase



        .from("teams")



        .delete()



        .eq("id", teamId);







    if (error) {



      console.error(error);







      alert(error.message);







      return;



    }







    setTeams(



      (currentTeams) =>



        currentTeams.filter(



          (item) =>



            item.id !== teamId



        )



    );







    alert(



      `${teamName} deleted successfully.`



    );



  };







  /* =================================================



     UPDATE EVENT STATUS



  ================================================= */







  const updateStatus = async (



    newStatus



  ) => {



    if (newStatus === "ROUND_2") {



      const { data: q } = await supabase.from("round_qualifications").select("team_id").eq("round", 2).eq("qualified", true);



      const { data: a } = await supabase.from("round2_assignments").select("team_id");



      if (!q?.length) { alert("First confirm Top N qualification."); return; }



      const assignedIds = new Set((a || []).map(x => x.team_id));



      const missing = q.filter(x => !assignedIds.has(x.team_id));



      if (missing.length) { alert("Every qualified team must have a unique challenge before Round 2 starts."); return; }



    }







    setLoading(true);







    const { error } =



      await supabase



        .from("event_state")



        .update({



          status: newStatus,







          round:



            newStatus ===



            "ROUND_2"



              ? 2



              : 1,







          updated_at:



            new Date().toISOString(),



        })



        .eq("id", 1);







    setLoading(false);







    if (error) {



      console.error(error);







      alert(error.message);







      return;



    }







    setStatus(newStatus);







    if (newStatus === "ROUND_1") {



      alert("Round 1 started! 30 questions • 15 minutes.");



    } else if (newStatus === "ROUND_2") {



      alert("Round 2 started! Qualified teams now have 30 minutes.");



    } else {



      alert("Event moved to waiting state.");



    }



  };







  /* =================================================



     LOGIN



  ================================================= */







  if (!loggedIn) {



    return (



      <main className="join-page">







        <div className="join-card">







          <div className="badge">



            ADMIN ACCESS



          </div>







          <h2>



            Admin Login



          </h2>







          <p>



            Enter the event



            administrator PIN.



          </p>







          <input



            type="password"



            placeholder="Admin PIN"



            value={pin}



            onChange={(e) =>



              setPin(



                e.target.value



              )



            }



            onKeyDown={(e) => {



              if (



                e.key ===



                "Enter"



              ) {



                login();



              }



            }}



          />







          <button



            className="primary-btn full"



            onClick={login}



          >



            Unlock Admin →



          </button>







        </div>







      </main>



    );



  }







  /* =================================================



     DASHBOARD



  ================================================= */







  return (



    <main className="admin-page">







      <div className="admin-header">







        <div>







          <div className="badge">



            ADMIN DASHBOARD



          </div>







          <h2>



            Web Designing Quiz



          </h2>







        </div>







        <div className="admin-status">







          <span>



            EVENT STATUS



          </span>







          <strong>



            {status}



          </strong>







        </div>







      </div>







      <div className="admin-grid">







        {/* EVENT CONTROL */}







        <section className="admin-card">







          <h3>



            Event Control



          </h3>







          <p>



            Control when teams



            can enter the quiz.



          </p>







          <button



            className="primary-btn full"



            onClick={() =>



              updateStatus(



                "ROUND_1"



              )



            }



            disabled={



              loading ||



              status ===



                "ROUND_1"



            }



          >



            ▶ Start Round 1



          </button>







          <button



            className="secondary-btn full"



            onClick={() =>



              updateStatus(



                "WAITING"



              )



            }



            disabled={loading}



          >



            ⏸ Stop / Reset



          </button>







        </section>







        {/* ROUND 2 CONTROL */}







        <section className="admin-card">



          <h3>Round 2 • UI Design Challenge</h3>



          <p>Finish Round 1, select Top N, then assign one different challenge to each qualified team.</p>







          <label>Top N Teams</label>



          <input type="number" min="1" value={topN} onChange={e => setTopN(e.target.value)} />



          <button className="secondary-btn full" onClick={confirmQualification} disabled={loading || status === "ROUND_2"}>✓ Confirm Qualification</button>







          {qualifiedTeams.length > 0 && (



            <div style={{ marginTop: 16 }}>



              <strong>Qualified Teams</strong>



              {qualifiedTeams.map(t => (



                <div key={t.id} className="team-row">

                  <div className="team-info">

                    <strong>{t.name}</strong>

                    <small>{t.college_name || "No college listed"}</small>

                  </div>

                  <span className="team-check">✓</span>

                </div>



              ))}



            </div>



          )}







          <label style={{ marginTop: 16, display: "block" }}>Unique Challenges (one per line)</label>



          <textarea rows="8" value={challengeText} onChange={e => setChallengeText(e.target.value)} style={{ width: "100%", boxSizing: "border-box", marginTop: 8 }} />



          <button className="secondary-btn full" onClick={createAndAssignChallenges} disabled={loading || !qualificationConfirmed}>🎯 Assign Unique Challenges</button>







          {assignments.length > 0 && (



            <div style={{ marginTop: 14 }}>



              <strong>Assignments</strong>



              {assignments.map(a => (



                <div key={a.team_id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 13 }}>



                  <b>{teams.find(t => t.id === a.team_id)?.name || "Team"}</b><br />



                  <span style={{ opacity: .75 }}>{a.round2_challenges?.challenge_title}</span>



                </div>



              ))}



            </div>



          )}







          <button className="primary-btn full" style={{ marginTop: 16 }} onClick={() => updateStatus("ROUND_2")} disabled={loading || status === "ROUND_2" || !qualificationConfirmed || assignments.length < qualifiedTeams.length}>▶ Start Round 2 • 30:00</button>

          <button
            className="secondary-btn full"
            onClick={() => updateStatus("WAITING")}
            disabled={loading}
          >
            ⏸ Stop / Reset Round 2
          </button>



        </section>







        
        {/* ROUND 2 JUDGING */}
        <section className="admin-card round2-judging-card">
          <h3>Round 2 • Judging & Results</h3>
          <p>Review each submitted website and enter marks from 0–20.</p>

          {qualifiedTeams.length === 0 && (
            <p className="muted">No qualified teams yet.</p>
          )}

          {qualifiedTeams.map(t => {
            const submission = round2Submissions.find(s => s.team_id === t.id);
            const score = judgingScores[t.id] || {};
            const fields = [
              ["ui_design", "UI Design"],
              ["creativity", "Creativity"],
              ["usability", "Usability"],
              ["responsiveness", "Responsiveness"],
              ["overall_execution", "Overall Execution"]
            ];

            return (
              <div className="judging-team-card" key={t.id}>
                <div className="judging-team-head">
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.college_name || "No college listed"}</small>
                  </div>
                  <b>{
                    ["ui_design", "creativity", "usability", "responsiveness", "overall_execution"]
                      .reduce((sum, field) => sum + (Number(score[field]) || 0), 0)
                  } / 100</b>
                </div>

                <div className="judging-challenge">
                  Challenge: {assignments.find(a => a.team_id === t.id)?.round2_challenges?.challenge_title || "—"}
                </div>

                <div className="judging-links">
                  {submission?.submission_url ? (
                    <a href={submission.submission_url} target="_blank" rel="noreferrer">Open Website ↗</a>
                  ) : (
                    <span>No website URL</span>
                  )}
                  {submission?.screenshot_url ? (
                    <a href={submission.screenshot_url} target="_blank" rel="noreferrer">Open Screenshot ↗</a>
                  ) : (
                    <span>No screenshot</span>
                  )}
                </div>

                <div className="judging-grid">
                  {fields.map(([field, label]) => (
                    <label key={field}>
                      <span>{label} <em>/20</em></span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={score[field] ?? ""}
                        onChange={e => updateJudgingField(t.id, field, e.target.value)}
                      />
                    </label>
                  ))}
                </div>

                <button
                  className="primary-btn full"
                  onClick={() => saveJudging(t.id)}
                  disabled={loading}
                >
                  SAVE MARKS • TOTAL {["ui_design", "creativity", "usability", "responsiveness", "overall_execution"]
                    .reduce((sum, field) => sum + (Number(score[field]) || 0), 0)}/100
                </button>
              </div>
            );
          })}

          {qualifiedTeams.length > 0 && (
            <button className="secondary-btn full" onClick={loadQualificationData} disabled={loading}>
              ↻ Refresh Submissions & Scores
            </button>
          )}
        </section>

{/* TEAMS */}







        <section className="admin-card">







          <div className="section-title">







            <h3>



              Registered Teams



            </h3>







            <span className="team-count">



              {teams.length}



            </span>







          </div>







          {teams.length === 0 && (



            <p>



              No teams registered



              yet.



            </p>



          )}







          {teams.map(



            (item) => (



              <div



                className="team-row"



                key={item.id}



              >







                <div className="team-info">







                  <strong>



                    {item.name}



                  </strong>







                  <small>



                    {item.members ||



                      "No members listed"}



                  </small>







                </div>







                <div className="team-actions">







                  <span className="team-check">



                    ✓



                  </span>







                  <button



                    className="delete-btn"



                    onClick={() =>



                      deleteTeam(



                        item.id,



                        item.name



                      )



                    }



                  >



                    Delete



                  </button>







                </div>







              </div>



            )



          )}







          {/* LIVE LEADERBOARD */}







          <AdminLiveLeaderboard



            teams={teams}



          />







        </section>







      </div>



    </main>



  );



}







/* =====================================================



   ADMIN LIVE LEADERBOARD



===================================================== */







function AdminLiveLeaderboard({



  teams,



}) {



  const [scores, setScores] =



    useState([]);







  const loadScores =



    useCallback(async () => {



      const { data, error } =



        await supabase



          .from("round_scores")



          .select(



            "team_id, round, score, updated_at"



          )



          .eq("round", 1);







      if (error) {



        console.error(



          "Leaderboard error:",



          error



        );







        return;



      }







      setScores(



        data || []



      );



    }, []);







  /* =================================================



     LIVE SCORE SYSTEM



  ================================================= */







  useEffect(() => {



    loadScores();







    /*



      SUPABASE REALTIME



    */







    const channel =



      supabase



        .channel(



          "admin-live-scores"



        )



        .on(



          "postgres_changes",



          {



            event: "*",



            schema: "public",



            table: "round_scores",



          },



          () => {



            loadScores();



          }



        )



        .subscribe();







    /*



      1 SECOND FALLBACK



      Ensures automatic update even



      if realtime notification is delayed.



    */







    const interval =



      setInterval(



        loadScores,



        1000



      );







    return () => {



      clearInterval(



        interval



      );







      supabase.removeChannel(



        channel



      );



    };



  }, [loadScores]);







  /* =================================================



     BUILD LEADERBOARD



  ================================================= */







  const leaderboard =



    useMemo(() => {



      const rows =



        teams.map((team) => {



          const scoreRow =



            scores.find(



              (score) =>



                score.team_id ===



                team.id



            );







          return {



            id: team.id,



            name: team.name,



            score:



              scoreRow?.score ||



              0,







            updated_at:



              scoreRow?.updated_at ||



              null,



          };



        });







      /*



        Sort:



        1. Highest score



        2. Team name as stable tie-break



      */







      rows.sort(



        (a, b) => {



          if (



            b.score !==



            a.score



          ) {



            return (



              b.score -



              a.score



            );



          }







          return a.name.localeCompare(



            b.name



          );



        }



      );







      return rows;



    }, [



      teams,



      scores,



    ]);







  return (



    <div className="live-leaderboard">







      {/* TITLE */}







      <div className="leaderboard-title">



        🔴 LIVE LEADERBOARD



      </div>







      <div



        style={{



          display: "flex",



          alignItems:



            "center",



          gap: "7px",



          marginBottom:



            "14px",



          color:



            "#4ade80",



          fontSize:



            "11px",



          fontWeight:



            "800",



        }}



      >







        <span



          style={{



            width: "7px",



            height: "7px",



            borderRadius:



              "50%",



            background:



              "#4ade80",



            display:



              "inline-block",



            boxShadow:



              "0 0 10px rgba(74,222,128,.7)",



          }}



        />







        LIVE • AUTO



        UPDATING







      </div>







      {leaderboard.length ===



      0 ? (



        <p>



          No teams yet.



        </p>



      ) : (



        leaderboard.map(



          (team, index) => (



            <div



              className="leaderboard-row"



              key={team.id}



            >







              {/* POSITION */}







              <div className="leaderboard-position">



                #{index + 1}



              </div>







              {/* TEAM */}







              <div className="leaderboard-team">



                {team.name}



              </div>







              {/* SCORE */}







              <div



                className="leaderboard-score"



                key={`${team.id}-${team.score}`}



              >



                {team.score}



              </div>







              {/* LIVE */}







              <div className="leaderboard-status">



                ● LIVE



              </div>







            </div>



          )



        )



      )}







    </div>



  );



}







export default App;