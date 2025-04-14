import React from "react";

export default function DrawDiagram({diagram}) {
    if (!diagram) return null;

    const size = 300;
    const padding = 50;

    const renderGrid = (rows, cols) => {
        const points = [];
        const spacingX = (size - 2 * padding) / (cols - 1);
        const spacingY = (size - 2 * padding) / (rows - 1);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                points.push(
                    <circle
                        key={`p-${r}-${c}`}
                        cx={padding + c * spacingX}
                        cy={padding + r * spacingY}
                        r={4}
                        fill="#1e90ff"
                    />
                );
            }
        }

        const lines = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 1; c++) {
                lines.push(
                    <line
                        key={`h-${r}-${c}`}
                        x1={padding + c * spacingX}
                        y1={padding + r * spacingY}
                        x2={padding + (c + 1) * spacingX}
                        y2={padding + r * spacingY}
                        stroke="#333"
                    />
                );
            }
        }
        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols; c++) {
                lines.push(
                    <line
                        key={`v-${r}-${c}`}
                        x1={padding + c * spacingX}
                        y1={padding + r * spacingY}
                        x2={padding + c * spacingX}
                        y2={padding + (r + 1) * spacingY}
                        stroke="#333"
                    />
                );
            }
        }

        return [
            ...lines,
            ...points
        ];
    };

    const renderCircles = (count) => {
        const spacing = (size - 2 * padding) / (count - 1);
        const y = size / 2;
        return Array.from({length: count}, (_, i) => (
            <circle
                key={`c-${i}`}
                cx={padding + i * spacing}
                cy={y}
                r={15}
                fill="#ff6347"
            />
        ));
    };
    const renderMixedCircles = (nested, separated) => {
        const cx = size / 2;
        const cy = size / 2;
        const maxR = size / 2 - padding;

        const nestedCircles = Array.from({length: nested}, (_, i) => (
            <circle
                key={`mc-n-${i}`}
                cx={cx}
                cy={cy}
                r={maxR * (1 - i * 0.2)}
                fill="none"
                stroke="#1e90ff"
                strokeWidth={2}
            />
        ));

        const spacing = (size - 2 * padding) / (separated - 1);
        const sepY = size - padding / 2;

        const separatedCircles = Array.from({length: separated}, (_, i) => (
            <circle
                key={`mc-s-${i}`}
                cx={padding + i * spacing}
                cy={sepY}
                r={10}
                fill="#ff6347"
            />
        ));

        return [
            ...nestedCircles,
            ...separatedCircles
        ];
    };


    const renderNestedCircles = (levels) => {
        const cx = size / 2;
        const cy = size / 2;
        const maxR = size / 2 - padding;
        return Array.from({length: levels}, (_, i) => (
            <circle
                key={`nc-${i}`}
                cx={cx}
                cy={cy}
                r={maxR * (1 - i * 0.2)}
                fill="none"
                stroke="#ff6347"
                strokeWidth={2}
            />
        ));
    };

    const renderNestedTriangles = (levels) => {
        const cx = size / 2;
        const cy = size / 2;
        const base = size - 2 * padding;
        const triangles = [];
        for (let i = 0; i < levels; i++) {
            const scale = 1 - i * 0.2;
            const h = (base * scale * Math.sqrt(3)) / 2;
            const p1 = `${cx},${cy - h / 2}`;
            const p2 = `${cx - (base * scale) / 2},${cy + h / 2}`;
            const p3 = `${cx + (base * scale) / 2},${cy + h / 2}`;
            triangles.push(
                <polygon
                    key={`nt-${i}`}
                    points={`${p1} ${p2} ${p3}`}
                    fill="none"
                    stroke="#1e90ff"
                    strokeWidth={2}
                />
            );
        }
        return triangles;
    };

    const renderTriangleGrid = (rows) => {
        const shapes = [];
        const base = size - 2 * padding;
        const stepY = base / rows;
        const cx = size / 2 * 1.5;
        for (let i = 0; i < rows; i++) {
            const count = i + 1;
            const spacing = base / count;
            const y = padding + i * stepY;
            for (let j = 0; j < count; j++) {
                shapes.push(
                    <polygon
                        key={`t-${i}-${j}`}
                        points={`${cx - (count / 2) * spacing + j * spacing},${y} ${cx - (count / 2) * spacing + (j + 0.5) * spacing},${y + stepY} ${cx - (count / 2) * spacing + (j - 0.5) * spacing},${y + stepY}`}
                        fill="#90ee90"
                        stroke="#333"
                    />
                );
            }
        }
        return shapes;
    };
    const renderCircleArt = (nestedList, scatteredList) => {
        const shapes = [];

        // Vẽ các nhóm lồng nhau, mỗi nhóm có vị trí riêng
        nestedList.forEach((group, idx) => {
            const {cx, cy, levels} = group;
            const maxR = 40;
            for (let i = 0; i < levels; i++) {
                shapes.push(
                    <circle
                        key={`art-n-${idx}-${i}`}
                        cx={cx}
                        cy={cy}
                        r={maxR * (1 - i * 0.2)}
                        fill="none"
                        stroke="#1e90ff"
                        strokeWidth={2}
                    />
                );
            }
        });

        // Vẽ các hình tròn tách biệt ở vị trí tùy chọn
        scatteredList.forEach((circle, idx) => {
            shapes.push(
                <circle
                    key={`art-s-${idx}`}
                    cx={circle.cx}
                    cy={circle.cy}
                    r={circle.r}
                    fill="#ff6347"
                />
            );
        });

        return shapes;
    };

    const renderRectangleGrid = (rows, cols) => {
        const shapes = [];
        const width = (size - 2 * padding) / cols;
        const height = (size - 2 * padding) / rows;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                shapes.push(
                    <rect
                        key={`r-${r}-${c}`}
                        x={padding + c * width}
                        y={padding + r * height}
                        width={width - 4}
                        height={height - 4}
                        fill="#ffe4b5"
                        stroke="#333"
                    />
                );
            }
        }
        return shapes;
    };

    let shapes = [];
    switch (diagram.type) {
        case "grid":
            const [rows, cols] = diagram.points;
            shapes = renderGrid(rows, cols);
            break;
        case "circle-art":
            shapes = renderCircleArt(diagram.nested, diagram.scattered);
            break;
        case "circle-row":
            shapes = renderCircles(diagram.count);
            break;
        case "circle-nested":
            shapes = renderNestedCircles(diagram.levels);
            break;
        case "triangle-nested":
            shapes = renderNestedTriangles(diagram.levels);
            break;
        case "triangle-grid":
            shapes = renderTriangleGrid(diagram.rows);
            break;
        case "rectangle-grid":
            shapes = renderRectangleGrid(diagram.rows, diagram.cols);
            break;
        case "circle-mixed":
            shapes = renderMixedCircles(diagram.nested, diagram.separated);
            break;
        default:
            break;
    }

    return (
        <svg width={size * 1.2} height={size} style={{border: "1px solid #ccc"}}>
            {shapes}
        </svg>
    );
}
