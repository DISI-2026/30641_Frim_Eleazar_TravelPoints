import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, ButtonGroup, Spinner, Alert, ToggleButton } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartData,
    type Point,
} from 'chart.js';
import { getAnalyticsTime, type HourlyStat, type MonthlyStat } from '../API/analytics_api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function processChartData(
    rawData: HourlyStat[] | MonthlyStat[]
): ChartData<"line", (number | Point | null)[]> {
    const isHourly = rawData.length > 0 && 'hour' in rawData[0];
    const isMonthly = rawData.length > 0 && 'month' in rawData[0];

    if (isHourly) {
        const hourlyData = rawData as HourlyStat[];
        return {
            labels: hourlyData.map(d => d.hour),
            datasets: [
                {
                    label: 'Vizitatori',
                    data: hourlyData.map(d => d.visits),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };
    } else if (isMonthly) {
        const monthlyData = rawData as MonthlyStat[];
        return {
            labels: monthlyData.map(d => d.month),
            datasets: [
                {
                    label: 'Vizitatori',
                    data: monthlyData.map(d => d.visits),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };
    }

    return {
        labels: rawData.map(d => 'hour' in d ? d.hour : d.month),
        datasets: [{
            label: 'Vizitatori',
            data: rawData.map(d => d.visits),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        }],
    };
}

const Analytics = ({ attraction_id }: { attraction_id: string }) => {
    const [granularity, setGranularity] = useState<'hour' | 'month'>('hour');

    const { data: analyticsData, isLoading, isError, error } = useQuery({
        queryKey: ['analyticsTime', attraction_id, granularity],
        queryFn: async () => {
            const res = await getAnalyticsTime(attraction_id, granularity);
            if (res.success === false) {
                throw new Error(res.error);
            }
            return res.data;
        }
    });

    const handleGranularityChange = (newGranularity: 'hour' | 'month') => {
        setGranularity(newGranularity);
    };

    if (isError) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    Eroare: {error instanceof Error ? error.message : 'Eroare necunoscută'}
                </Alert>
            </Container>
        );
    }

    const chartData = (isLoading || isError) ? {
        labels: [],
        datasets: [{
            label: 'Vizitatori',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        }],
    } : processChartData(analyticsData!)

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 14
                    }
                }
            },
            title: {
                display: false,
                text: 'Vizitatori',
                font: {
                    size: 16,
                    weight: 'bold' as const
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 100
                }
            }
        }
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">Flux Vizitatori</h4>
                <ButtonGroup className="bg-light p-1 rounded-pill shadow-sm border">
                    {[
                        { label: 'Ore', value: 'hour' },
                        { label: 'Luni', value: 'month' }
                    ].map((radio, idx) => (
                        <ToggleButton
                            key={idx}
                            id={`radio-analytics-${idx}`}
                            type="radio"
                            variant="link"
                            className={`rounded-pill px-4 py-1 text-decoration-none border-0 ${granularity === radio.value ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}`}
                            name="radio-analytics"
                            value={radio.value}
                            checked={granularity === radio.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGranularityChange(e.currentTarget.value as 'hour' | 'month')}
                        >
                            {radio.label}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
            </div>

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Se încarcă...</span>
                    </Spinner>
                </div>
            ) : (
                <div style={{ position: 'relative', height: '400px', marginBottom: '20px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </Container>
    );
};

export default Analytics;
