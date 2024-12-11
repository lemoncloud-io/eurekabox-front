import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    {
        name: '1월',
        활성사용자: 400,
        신규가입: 240,
    },
    {
        name: '2월',
        활성사용자: 300,
        신규가입: 139,
    },
    {
        name: '3월',
        활성사용자: 500,
        신규가입: 380,
    },
    {
        name: '4월',
        활성사용자: 450,
        신규가입: 300,
    },
    {
        name: '5월',
        활성사용자: 470,
        신규가입: 320,
    },
    {
        name: '6월',
        활성사용자: 580,
        신규가입: 400,
    },
];

export function UserStats() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `${value}`}
                />
                <Tooltip />
                <Line type="monotone" dataKey="활성사용자" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="신규가입" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
}
