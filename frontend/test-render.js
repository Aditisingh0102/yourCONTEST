import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import ContestQuestions from './src/pages/faculty/ContestQuestions.jsx';
import { ThemeProvider } from './src/hooks/useTheme.jsx';

try {
  const html = ReactDOMServer.renderToString(
    <StaticRouter location="/faculty/manage-contests/123/questions?mcq=1&coding=1">
      <ContestQuestions />
    </StaticRouter>
  );
  console.log("Render successful");
} catch (e) {
  console.error("Render failed:");
  console.error(e);
}
