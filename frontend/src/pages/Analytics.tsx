import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Button, ButtonGroup, Spinner, Alert } from 'react-bootstrap';
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
                    label: 'Visits',
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
                    label: 'Visits',
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
            label: 'Visits',
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
            label: 'Visits',
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
                display: true,
                text: granularity === 'hour' ? 'Fluxul de vizitatori - Detalii pe ore' : 'Fluxul de vizitatori - Sumar pe luni',
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
                <h4>Analitică - Fluxul de Vizitatori</h4>
                <ButtonGroup>
                    <Button
                        variant={granularity === 'hour' ? 'primary' : 'outline-primary'}
                        onClick={() => handleGranularityChange('hour')}
                    >
                        Pe ore
                    </Button>
                    <Button
                        variant={granularity === 'month' ? 'primary' : 'outline-primary'}
                        onClick={() => handleGranularityChange('month')}
                    >
                        Pe luni
                    </Button>
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
