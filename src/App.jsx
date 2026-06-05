import { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

function App() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async () => {
        setError('');
        setSuccess('');
        if (!userId.trim() || !password.trim()) {
            setError('아이디와 비밀번호를 입력해주세요');
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId: userId, password }),
            });
            const result = await response.text();
            if (result.startsWith('성공')) {
                setSuccess(result);
            } else {
                setError(result.replace('실패: ', ''));
            }
        } catch (e) {
            setError('연결 실패: ' + e.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900">사고접수 통합 시스템</h1>
                    <p className="text-sm text-slate-500 mt-1">F&F · 메타엠 · 로젠</p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">아이디</label>
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="아이디를 입력하세요"
                                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">비밀번호</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-md flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-md flex items-center gap-2">
                            <ShieldCheck size={14} />
                            {success}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition mt-4"
                    >
                        로그인
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 text-center mb-2">테스트 계정</div>
                    <div className="text-[10px] text-slate-500 space-y-0.5 font-mono bg-slate-50 rounded-md p-2">
                        <div>메타엠: metam_juhi / pass1234</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;