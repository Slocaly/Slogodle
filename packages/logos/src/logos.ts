export interface Logo {
  name: string
  industry: string
  founded: number
  description: string
  funFact: string
  /** Path to the logo's SVG file under public/. */
  icon: string
  /** Intrinsic width/height ratio of the icon, used to size it in the physics pile. */
  aspect: number
  /** Link to the project's GitHub repository. */
  gitLink: string
}

export const LOGOS: Logo[] = [
  {
    name: "Capacitor",
    industry: "Native app runtime",
    founded: 2018,
    description:
      "Capacitor is an open-source native runtime that lets web apps built with HTML, CSS, and JavaScript run as native iOS, Android, and desktop applications.",
    funFact:
      "Capacitor was built by the Ionic team as a modern successor to Cordova, giving web apps direct native iOS and Android runtime access.",
    icon: "/logos/capacitor.svg",
    aspect: 1,
    gitLink: "https://github.com/ionic-team/capacitor",
  },
  {
    name: "Git",
    industry: "Version control system",
    founded: 2005,
    description:
      "Git is a distributed version control system that tracks changes to source code, letting many developers work on the same project in parallel.",
    funFact:
      "Linus Torvalds wrote the first version of Git in about ten days after a licensing dispute forced the Linux kernel project to abandon its previous tool, BitKeeper.",
    icon: "/logos/git.svg",
    aspect: 1,
    gitLink: "https://github.com/git/git",
  },
  {
    name: "Grafana",
    industry: "Observability platform",
    founded: 2014,
    description:
      "Grafana is an open-source platform for querying, visualizing, and alerting on metrics, logs, and traces from many different data sources.",
    funFact:
      "Grafana started as a fork of Kibana that swapped in richer, more flexible time-series graphing before growing into its own independent project.",
    icon: "/logos/grafana.svg",
    aspect: 0.918,
    gitLink: "https://github.com/grafana/grafana",
  },
  {
    name: "Karma",
    industry: "Test runner",
    founded: 2012,
    description:
      "Karma is a JavaScript test runner that executes test suites against real browsers and reports the results back to the developer.",
    funFact:
      "Karma was originally called Testacular, and was built by the AngularJS team to run tests across real browsers instead of a simulated environment.",
    icon: "/logos/karma.svg",
    aspect: 1.293,
    gitLink: "https://github.com/karma-runner/karma",
  },
  {
    name: "Svelte",
    industry: "JavaScript framework",
    founded: 2016,
    description:
      "Svelte is a JavaScript framework that compiles components into small, dependency-free vanilla JavaScript at build time instead of shipping a runtime.",
    funFact:
      "Svelte does its heavy lifting at build time, compiling components into vanilla JavaScript rather than shipping a framework runtime to the browser.",
    icon: "/logos/svelte.svg",
    aspect: 0.831,
    gitLink: "https://github.com/sveltejs/svelte",
  },
  {
    name: "Ionic",
    industry: "Mobile app framework",
    founded: 2013,
    description:
      "Ionic is an open-source UI toolkit for building cross-platform mobile, desktop, and web apps from a single codebase using web technologies.",
    funFact:
      "Ionic originally targeted Angular exclusively before rebuilding its component library on web standards so it could support React and Vue too.",
    icon: "/logos/ionic.svg",
    aspect: 1,
    gitLink: "https://github.com/ionic-team/ionic-framework",
  },
  {
    name: "Backbone.js",
    industry: "JavaScript library",
    founded: 2010,
    description:
      "Backbone.js is a lightweight JavaScript library that gives web applications structure through models, views, and collections built on RESTful JSON APIs.",
    funFact:
      "Backbone.js was created by Jeremy Ashkenas, who also created CoffeeScript, and requires only Underscore.js as its single hard dependency.",
    icon: "/logos/backbonejs.svg",
    aspect: 1,
    gitLink: "https://github.com/jashkenas/backbone",
  },
  {
    name: "Netlify",
    industry: "Web hosting platform",
    founded: 2014,
    description:
      "Netlify is a cloud platform for building, deploying, and hosting static sites and web applications, with built-in CI/CD, forms, and serverless functions.",
    funFact:
      "Netlify is widely credited with popularizing the term 'Jamstack' to describe sites built from pre-rendered markup, APIs, and JavaScript.",
    icon: "/logos/netlify.svg",
    aspect: 1.133,
    gitLink: "https://github.com/netlify",
  },
  {
    name: "React",
    industry: "JavaScript library",
    founded: 2013,
    description:
      "React is a JavaScript library for building user interfaces out of reusable, composable components with a declarative, component-based programming model.",
    funFact:
      "React was originally built for Facebook's News Feed and only open-sourced in 2013 after engineer Jordan Walke championed it internally.",
    icon: "/logos/react.svg",
    aspect: 1.123,
    gitLink: "https://github.com/facebook/react",
  },
  {
    name: "Rolldown",
    industry: "JavaScript bundler",
    founded: 2024,
    description:
      "Rolldown is a Rust-based JavaScript bundler with a Rollup-compatible API, built to power the next generation of the Vite build pipeline.",
    funFact:
      "Rolldown is a Rust rewrite of Rollup built by Vue creator Evan You's company VoidZero, designed to become the new bundling core underneath Vite.",
    icon: "/logos/rolldown.svg",
    aspect: 1.631,
    gitLink: "https://github.com/rolldown/rolldown",
  },
  {
    name: "Java",
    industry: "Programming language",
    founded: 1995,
    description:
      "Java is a general-purpose, object-oriented programming language designed to let compiled code run on any platform via the Java Virtual Machine.",
    funFact:
      "Java was originally called Oak, named by creator James Gosling after an oak tree outside his office, before being renamed for trademark reasons ahead of its 1995 launch.",
    icon: "/logos/java.svg",
    aspect: 1,
    gitLink: "https://github.com/openjdk/jdk",
  },
  {
    name: "Turbopack",
    industry: "JavaScript bundler",
    founded: 2022,
    description:
      "Turbopack is an incremental JavaScript and TypeScript bundler written in Rust, built as a faster successor to webpack for large applications.",
    funFact:
      "Turbopack was announced by Webpack's original creator Tobias Koppers after he joined Vercel to build its Rust-based successor.",
    icon: "/logos/turbopack.svg",
    aspect: 0.874,
    gitLink: "https://github.com/vercel/turborepo",
  },
  {
    name: "Parcel",
    industry: "JavaScript bundler",
    founded: 2017,
    description:
      "Parcel is a zero-configuration web application bundler that automatically resolves and builds JavaScript, CSS, HTML, and other assets.",
    funFact:
      "Parcel was created by Devon Govett, who also created the Adobe font-rendering library Fontkit, and its zero-config approach was a direct reaction to webpack's steep learning curve.",
    icon: "/logos/parcel.svg",
    aspect: 1.326,
    gitLink: "https://github.com/parcel-bundler/parcel",
  },
  {
    name: "Expo",
    industry: "React Native platform",
    founded: 2012,
    description:
      "Expo is a framework and platform built around React Native for building, deploying, and iterating on native iOS and Android apps.",
    funFact:
      "Expo was founded by Charlie Cheever, a former Amazon and Quora engineer, and James Ide, aiming to remove the need to touch Xcode or Android Studio for most apps.",
    icon: "/logos/expo.svg",
    aspect: 1.108,
    gitLink: "https://github.com/expo/expo",
  },
  {
    name: "MongoDB",
    industry: "NoSQL database",
    founded: 2009,
    description:
      "MongoDB is a NoSQL document database that stores data as flexible, JSON-like BSON documents instead of rows and tables.",
    funFact:
      "MongoDB started as part of a planned platform-as-a-service by the startup 10gen before the team pivoted and the database itself became the flagship product.",
    icon: "/logos/mongodb.svg",
    aspect: 1,
    gitLink: "https://github.com/mongodb/mongo",
  },
  {
    name: "tRPC",
    industry: "TypeScript API library",
    founded: 2020,
    description:
      "tRPC is a TypeScript library for building fully type-safe APIs between client and server without writing schemas or code generation.",
    funFact:
      "tRPC began as a proof-of-concept called ZodRPC, built by Zod creator Colin McDonnell and then abandoned, until Alex 'KATT' Johansson found the repo and grew it into tRPC.",
    icon: "/logos/trpc.svg",
    aspect: 1,
    gitLink: "https://github.com/trpc/trpc",
  },
  {
    name: "Kafka",
    industry: "Event streaming platform",
    founded: 2011,
    description:
      "Apache Kafka is a distributed event streaming platform used to publish, subscribe to, store, and process high-throughput streams of records.",
    funFact:
      "Kafka was built at LinkedIn and named by co-creator Jay Kreps after the writer Franz Kafka, simply because he liked his work.",
    icon: "/logos/kafka.svg",
    aspect: 0.62,
    gitLink: "https://github.com/apache/kafka",
  },
  {
    name: "Testing Library",
    industry: "Testing utility",
    founded: 2018,
    description:
      "Testing Library is a family of testing utilities that encourage testing UI components the way a real user would interact with them.",
    funFact:
      "Testing Library was built by Kent C. Dodds around one guiding principle: tests should interact with an app the same way a real user would.",
    icon: "/logos/testing-library.svg",
    aspect: 1,
    gitLink: "https://github.com/testing-library/testing-library-docs",
  },
  {
    name: "React Router",
    industry: "Routing library",
    founded: 2014,
    description:
      "React Router is a routing library for React applications that maps URLs to components and manages navigation in single-page apps.",
    funFact:
      "React Router predates React's official Context API and originally had to build its own workaround to pass routing data down the component tree.",
    icon: "/logos/react-router.svg",
    aspect: 1.829,
    gitLink: "https://github.com/remix-run/react-router",
  },
  {
    name: "Sentry",
    industry: "Error tracking platform",
    founded: 2008,
    description:
      "Sentry is an application monitoring platform that captures errors, exceptions, and performance issues in real time across many languages and frameworks.",
    funFact:
      "Sentry began as a small internal tool at Disqus for tracking Django errors before its creators spun it out into its own company.",
    icon: "/logos/sentry.svg",
    aspect: 1.128,
    gitLink: "https://github.com/getsentry/sentry",
  },
  {
    name: "Pico CSS",
    industry: "CSS framework",
    founded: 2019,
    description:
      "Pico CSS is a minimal CSS framework that styles semantic HTML elements directly, so plain markup looks polished without extra classes.",
    funFact:
      "Pico CSS was created by French developer Lucas Larroche as a personal project to make plain HTML look good without writing any CSS at all.",
    icon: "/logos/picocss.svg",
    aspect: 1,
    gitLink: "https://github.com/picocss/pico",
  },
  {
    name: "Leaflet",
    industry: "Mapping library",
    founded: 2011,
    description:
      "Leaflet is an open-source JavaScript library for building interactive, mobile-friendly maps with a small footprint and simple API.",
    funFact:
      "Leaflet was built by Ukrainian developer Vladimir Agafonkin with a deliberate focus on staying small and simple rather than feature-complete.",
    icon: "/logos/leaflet.svg",
    aspect: 1,
    gitLink: "https://github.com/Leaflet/Leaflet",
  },
  {
    name: "Google Cloud",
    industry: "Cloud platform",
    founded: 2008,
    description:
      "Google Cloud is Google's suite of cloud computing services, offering compute, storage, databases, networking, and machine learning infrastructure.",
    funFact:
      "Google Cloud's first public product was App Engine in 2008, built on the same infrastructure that powered Google Search internally.",
    icon: "/logos/google-cloud.svg",
    aspect: 1.243,
    gitLink: "https://github.com/googleapis/google-cloud-node",
  },
  {
    name: "Slidev",
    industry: "Presentation framework",
    founded: 2020,
    description:
      "Slidev is a developer-focused presentation tool that lets slide decks be written in Markdown and rendered in the browser.",
    funFact:
      "Slidev was created by Anthony Fu as a way to write conference talks in Markdown without leaving his code editor.",
    icon: "/logos/slidev.svg",
    aspect: 1,
    gitLink: "https://github.com/slidevjs/slidev",
  },
  {
    name: "Datadog",
    industry: "Monitoring platform",
    founded: 2010,
    description:
      "Datadog is a cloud monitoring and observability platform that unifies metrics, traces, and logs across infrastructure and applications.",
    funFact:
      "Datadog was founded by two engineers who met while working at IBM and Boxever, prompted by their own frustration debugging distributed systems.",
    icon: "/logos/datadog.svg",
    aspect: 0.931,
    gitLink: "https://github.com/DataDog",
  },
  {
    name: "Chakra UI",
    industry: "UI component library",
    founded: 2019,
    description:
      "Chakra UI is a React component library that provides accessible, reusable, and composable building blocks for web applications.",
    funFact: "Chakra UI was created by Segun Adebayo and builds WAI-ARIA accessibility compliance into its components by default.",
    icon: "/logos/chakra-ui.svg",
    aspect: 1,
    gitLink: "https://github.com/chakra-ui/chakra-ui",
  },
  {
    name: "Socket.IO",
    industry: "Realtime library",
    founded: 2010,
    description:
      "Socket.IO is a JavaScript library for real-time, bidirectional, event-based communication between browsers and servers.",
    funFact: "Socket.IO was co-created by Guillermo Rauch, who later founded Vercel and created Next.js.",
    icon: "/logos/socket-io.svg",
    aspect: 1,
    gitLink: "https://github.com/socketio/socket.io",
  },
  {
    name: "Alpine.js",
    industry: "JavaScript framework",
    founded: 2019,
    description:
      "Alpine.js is a lightweight JavaScript framework for adding reactive, declarative behavior directly to HTML markup with minimal overhead.",
    funFact:
      "Alpine.js was created by Caleb Porzio as a lightweight way to add Vue-like reactivity straight in HTML, and its README once described it as 'Tailwind for JavaScript'.",
    icon: "/logos/alpinejs.svg",
    aspect: 2.169,
    gitLink: "https://github.com/alpinejs/alpine",
  },
  {
    name: "Solidity",
    industry: "Smart contract language",
    founded: 2014,
    description:
      "Solidity is a statically typed programming language designed for writing smart contracts that run on the Ethereum Virtual Machine.",
    funFact:
      "Solidity was designed for the Ethereum Virtual Machine by Gavin Wood, Christian Reitwiessner, and others, with syntax deliberately modeled on JavaScript and C++ to feel familiar to existing developers.",
    icon: "/logos/solidity.svg",
    aspect: 1,
    gitLink: "https://github.com/ethereum/solidity",
  },
  {
    name: "CakePHP",
    industry: "PHP framework",
    founded: 2005,
    description:
      "CakePHP is a rapid-development PHP framework that provides an MVC structure, ORM, and code-generation tools for building web applications.",
    funFact:
      "CakePHP began as a minimal framework called 'Cake', written by Polish developer Michal Tatarynowicz and explicitly modeled after Ruby on Rails.",
    icon: "/logos/cakephp.svg",
    aspect: 1.28,
    gitLink: "https://github.com/cakephp/cakephp",
  },
  {
    name: "Next.js",
    industry: "React framework",
    founded: 2016,
    description:
      "Next.js is a React framework that adds server-side rendering, static site generation, and file-based routing for production web apps.",
    funFact:
      "Next.js was created by Vercel (then called Zeit) to give React server-side rendering and routing out of the box without hand-rolled configuration.",
    icon: "/logos/nextjs.svg",
    aspect: 1,
    gitLink: "https://github.com/vercel/next.js",
  },
  {
    name: "CircleCI",
    industry: "CI/CD platform",
    founded: 2011,
    description:
      "CircleCI is a continuous integration and delivery platform that automates building, testing, and deploying software from a version control repository.",
    funFact: "CircleCI was one of the first hosted continuous integration services to support Docker-based build environments.",
    icon: "/logos/circleci.svg",
    aspect: 0.988,
    gitLink: "https://github.com/CircleCI-Public",
  },
  {
    name: "Python",
    industry: "Programming language",
    founded: 1991,
    description:
      "Python is a high-level, general-purpose programming language known for its readable syntax and broad use across web, data, and automation.",
    funFact: "Python is named after the British comedy show Monty Python's Flying Circus, not the snake.",
    icon: "/logos/python.svg",
    aspect: 1.004,
    gitLink: "https://github.com/python/cpython",
  },
  {
    name: "Dart",
    industry: "Programming language",
    founded: 2011,
    description:
      "Dart is an object-oriented programming language developed by Google, best known as the language behind the Flutter UI toolkit.",
    funFact:
      "Dart was originally pitched by Google as a possible replacement for JavaScript in browsers before it found its true home powering Flutter.",
    icon: "/logos/dart.svg",
    aspect: 1,
    gitLink: "https://github.com/dart-lang/sdk",
  },
  {
    name: "Dependabot",
    industry: "Dependency automation",
    founded: 2017,
    description:
      "Dependabot is an automated tool that scans project dependencies for known vulnerabilities and opens pull requests to update them.",
    funFact:
      "Dependabot began as an independent startup before GitHub acquired it in 2019 and folded it directly into repository security features.",
    icon: "/logos/dependabot.svg",
    aspect: 0.934,
    gitLink: "https://github.com/dependabot",
  },
  {
    name: "Vite",
    industry: "Build tool",
    founded: 2020,
    description:
      "Vite is a build tool and development server that serves source files over native ES modules for near-instant startup and hot reloading.",
    funFact:
      "Vite is French for 'fast' and was created by Vue's Evan You, serving source files over native ES modules in development to skip bundling entirely.",
    icon: "/logos/vite.svg",
    aspect: 1.631,
    gitLink: "https://github.com/vitejs/vite",
  },
  {
    name: "MariaDB",
    industry: "Relational database",
    founded: 2009,
    description:
      "MariaDB is an open-source relational database management system that started as a community-driven fork of MySQL.",
    funFact:
      "MariaDB was forked from MySQL by its original creator Michael Widenius the day Oracle acquired Sun, out of concern for MySQL's future as open source.",
    icon: "/logos/mariadb.svg",
    aspect: 1.506,
    gitLink: "https://github.com/MariaDB/server",
  },
  {
    name: "WebRTC",
    industry: "Real-time communication API",
    founded: 2011,
    description:
      "WebRTC is an open standard and browser API that enables real-time audio, video, and data communication directly between peers.",
    funFact:
      "WebRTC was open-sourced by Google in 2011 after its acquisition of Global IP Solutions, and it's the technology underneath most in-browser video calling, including Google Meet and Discord's web client.",
    icon: "/logos/webrtc.svg",
    aspect: 1.028,
    gitLink: "https://github.com/w3c/webrtc-pc",
  },
  {
    name: "Hugo",
    industry: "Static site generator",
    founded: 2013,
    description:
      "Hugo is a static site generator written in Go that builds websites from Markdown content and templates.",
    funFact:
      "Hugo is written in Go, and creator Steve Francia (spf13) designed it to regenerate an entire site of thousands of pages in well under a second.",
    icon: "/logos/hugo.svg",
    aspect: 1,
    gitLink: "https://github.com/gohugoio/hugo",
  },
  {
    name: "jQuery",
    industry: "JavaScript library",
    founded: 2006,
    description:
      "jQuery is a JavaScript library that simplifies HTML DOM manipulation, event handling, animation, and AJAX interactions across browsers.",
    funFact: "John Resig introduced jQuery at BarCamp NYC in January 2006 under the tagline 'write less, do more'.",
    icon: "/logos/jquery.svg",
    aspect: 1,
    gitLink: "https://github.com/jquery/jquery",
  },
  {
    name: "Partytown",
    industry: "Web performance library",
    founded: 2021,
    description:
      "Partytown is a library that relocates resource-intensive third-party scripts off a web page's main thread and into a web worker.",
    funFact:
      "Partytown gets its name from the idea of scripts happily 'attending the party' in a web worker sandbox instead of crashing it by hogging the main thread.",
    icon: "/logos/partytown.svg",
    aspect: 0.955,
    gitLink: "https://github.com/BuilderIO/partytown",
  },
  {
    name: "PowerSync",
    industry: "Offline sync engine",
    founded: 2022,
    description:
      "PowerSync is an offline-first sync engine that keeps a local SQLite database in sync with a backend Postgres, MySQL, or MongoDB database.",
    funFact:
      "PowerSync was spun out of JourneyApps, whose offline-first mobile platform had already been syncing data for enterprise field teams for over a decade.",
    icon: "/logos/powersync.svg",
    aspect: 1.333,
    gitLink: "https://github.com/powersync-ja/powersync-js",
  },
  {
    name: "Chromatic",
    industry: "Visual testing platform",
    founded: 2017,
    description:
      "Chromatic is a visual testing and review platform built around Storybook that catches UI regressions with automated screenshot comparisons.",
    funFact:
      "Chromatic is built by the same team behind Storybook and was designed specifically to catch UI regressions with visual snapshots.",
    icon: "/logos/chromatic.svg",
    aspect: 1,
    gitLink: "https://github.com/chromaui/chromatic-cli",
  },
  {
    name: "PostgreSQL",
    industry: "Relational database",
    founded: 1996,
    description:
      "PostgreSQL is an open-source object-relational database system known for its standards compliance, extensibility, and reliability.",
    funFact:
      "PostgreSQL traces its roots to the POSTGRES project at UC Berkeley in the 1980s, led by database pioneer Michael Stonebraker.",
    icon: "/logos/postgresql.svg",
    aspect: 0.97,
    gitLink: "https://github.com/postgres/postgres",
  },
  {
    name: "Prettier",
    industry: "Code formatter",
    founded: 2017,
    description:
      "Prettier is an opinionated code formatter that automatically reformats source code to a consistent style across many languages.",
    funFact:
      "Prettier deliberately offers very few configuration options, reprinting code from scratch according to its own rules to end debates over formatting style.",
    icon: "/logos/prettier.svg",
    aspect: 1,
    gitLink: "https://github.com/prettier/prettier",
  },
  {
    name: "Bun",
    industry: "JavaScript runtime",
    founded: 2022,
    description:
      "Bun is a fast, all-in-one JavaScript runtime, bundler, transpiler, and package manager built as a drop-in alternative to Node.js.",
    funFact: "Bun is written in Zig and bundles a runtime, bundler, test runner, and package manager into a single fast binary.",
    icon: "/logos/bun.svg",
    aspect: 1,
    gitLink: "https://github.com/oven-sh/bun",
  },
  {
    name: "Codecov",
    industry: "Code coverage platform",
    founded: 2013,
    description:
      "Codecov is a code coverage reporting tool that integrates with CI pipelines to visualize which parts of a codebase are tested.",
    funFact:
      "Codecov grew out of a hackathon project before becoming one of the most widely used coverage-reporting tools for open source projects.",
    icon: "/logos/codecov.svg",
    aspect: 1.045,
    gitLink: "https://github.com/codecov",
  },
  {
    name: "MDX",
    industry: "Markdown/JSX format",
    founded: 2018,
    description:
      "MDX is a file format that combines Markdown with embedded JSX, letting interactive components be written inside prose documents.",
    funFact:
      "MDX lets developers write JSX directly inside Markdown documents, and it grew out of work at ZEIT (now Vercel) to make documentation sites more interactive.",
    icon: "/logos/mdx.svg",
    aspect: 2.415,
    gitLink: "https://github.com/mdx-js/mdx",
  },
  {
    name: "Angular",
    industry: "JavaScript framework",
    founded: 2016,
    description:
      "Angular is a TypeScript-based web application framework developed by Google for building single-page applications.",
    funFact:
      "Angular was a complete rewrite of AngularJS released in September 2016, swapping JavaScript controllers for TypeScript components with no backward compatibility.",
    icon: "/logos/angular.svg",
    aspect: 1,
    gitLink: "https://github.com/angular/angular",
  },
  {
    name: "Prometheus",
    industry: "Monitoring system",
    founded: 2012,
    description:
      "Prometheus is an open-source monitoring system that collects and stores metrics as time-series data and supports powerful querying and alerting.",
    funFact:
      "Prometheus was built at SoundCloud in 2012, drawing heavy inspiration from Google's internal monitoring tool Borgmon, and is named after the Greek Titan who gave fire to humanity.",
    icon: "/logos/prometheus.svg",
    aspect: 1,
    gitLink: "https://github.com/prometheus/prometheus",
  },
  {
    name: "Rust",
    industry: "Programming language",
    founded: 2010,
    description:
      "Rust is a systems programming language focused on memory safety, concurrency, and performance without a garbage collector.",
    funFact:
      "Rust began as Graydon Hoare's personal side project in 2006 before Mozilla sponsored it, and he first publicly unveiled it at Mozilla's 2010 Annual Summit.",
    icon: "/logos/rust.svg",
    aspect: 1,
    gitLink: "https://github.com/rust-lang/rust",
  },
  {
    name: "Fastify",
    industry: "Node.js web framework",
    founded: 2016,
    description:
      "Fastify is a fast, low-overhead web framework for Node.js built around schema-based request validation and serialization.",
    funFact:
      "Fastify was created by Matteo Collina and Tomas Della Vedova, who set out to build the fastest possible web framework for Node.js and benchmark it publicly against every rival.",
    icon: "/logos/fastify.svg",
    aspect: 1.552,
    gitLink: "https://github.com/fastify/fastify",
  },
  {
    name: "Mock Service Worker",
    industry: "API mocking library",
    founded: 2019,
    description:
      "Mock Service Worker is a library that intercepts network requests at the browser or Node.js level to serve mocked API responses.",
    funFact:
      "Mock Service Worker was created by Artem Zakharchenko specifically so mocked API responses would be indistinguishable from real network traffic in browser dev tools.",
    icon: "/logos/msw.svg",
    aspect: 1,
    gitLink: "https://github.com/mswjs/msw",
  },
  {
    name: "Webhooks",
    industry: "HTTP callback pattern",
    founded: 2007,
    description:
      "Webhooks are user-defined HTTP callbacks that let one application automatically notify another when a specific event occurs.",
    funFact:
      "The term 'webhook' was coined in 2007 by Jeff Lindsay, a hackathon-era portmanteau of 'web' and the programming concept of a callback 'hook'.",
    icon: "/logos/webhooks.svg",
    aspect: 1.071,
    gitLink: "https://github.com/standard-webhooks/standard-webhooks",
  },
  {
    name: "TypeScript",
    industry: "Typed superset of JavaScript",
    founded: 2012,
    description:
      "TypeScript is a strongly typed programming language that builds on JavaScript by adding static types, compiling down to plain JavaScript.",
    funFact:
      "TypeScript was designed by Anders Hejlsberg, who also created C# and Turbo Pascal, to add optional static typing to JavaScript for Microsoft's own large codebases.",
    icon: "/logos/typescript.svg",
    aspect: 1,
    gitLink: "https://github.com/microsoft/TypeScript",
  },
  {
    name: "Node.js",
    industry: "JavaScript runtime",
    founded: 2009,
    description:
      "Node.js is a JavaScript runtime built on Chrome's V8 engine that lets JavaScript run outside the browser, commonly for servers.",
    funFact:
      "Node.js was created by Ryan Dahl, who was frustrated that most web servers of the time couldn't handle many simultaneous connections efficiently, and built it on Chrome's V8 engine to fix that.",
    icon: "/logos/nodejs.svg",
    aspect: 1,
    gitLink: "https://github.com/nodejs/node",
  },
  {
    name: "Argo",
    industry: "Kubernetes workflow engine",
    founded: 2017,
    description:
      "Argo is a suite of open-source tools for running workflows, managing continuous delivery, and progressive deployments on Kubernetes.",
    funFact:
      "Argo started as a container-native workflow engine at Applatix before being donated to the Cloud Native Computing Foundation.",
    icon: "/logos/argo.svg",
    aspect: 0.783,
    gitLink: "https://github.com/argoproj/argo-workflows",
  },
  {
    name: "Drupal",
    industry: "Content management system",
    founded: 2001,
    description:
      "Drupal is an open-source content management system used to build and manage websites of varying scale and complexity.",
    funFact:
      "Drupal began as a message board for founder Dries Buytaert and his friends, and takes its name from the Dutch word 'druppel', meaning 'drop'.",
    icon: "/logos/drupal.svg",
    aspect: 1,
    gitLink: "https://github.com/drupal/drupal",
  },
  {
    name: "Waku",
    industry: "React framework",
    founded: 2023,
    description:
      "Waku is a minimal React framework built around React Server Components, designed for small footprint and simplicity.",
    funFact:
      "Waku was created by Daishi Kato, the same developer behind the state-management libraries Zustand and Jotai, as a minimal framework built around React Server Components.",
    icon: "/logos/waku.svg",
    aspect: 1,
    gitLink: "https://github.com/wakujs/waku",
  },
  {
    name: "Deno",
    industry: "JavaScript runtime",
    founded: 2018,
    description:
      "Deno is a secure-by-default JavaScript and TypeScript runtime built on V8 and Rust, with built-in tooling and native TypeScript support.",
    funFact:
      "Deno was created by Ryan Dahl, the original creator of Node.js, partly to fix design decisions he outlined regretting in a talk called '10 Things I Regret About Node.js'.",
    icon: "/logos/denojs.svg",
    aspect: 1,
    gitLink: "https://github.com/denoland/deno",
  },
  {
    name: "NGINX",
    industry: "Web server",
    founded: 2004,
    description:
      "NGINX is a high-performance web server, reverse proxy, and load balancer used to serve and route web traffic at scale.",
    funFact:
      "NGINX was written by Igor Sysoev specifically to solve the C10k problem: handling ten thousand concurrent connections efficiently on a single server.",
    icon: "/logos/nginx.svg",
    aspect: 0.88,
    gitLink: "https://github.com/nginx/nginx",
  },
  {
    name: "Chart.js",
    industry: "Data visualization",
    founded: 2013,
    description:
      "Chart.js is a JavaScript library for creating simple, responsive charts and graphs rendered on an HTML canvas element.",
    funFact:
      "Chart.js renders every chart on an HTML5 canvas element instead of SVG, a deliberate choice for performance with large datasets.",
    icon: "/logos/chartjs.svg",
    aspect: 0.865,
    gitLink: "https://github.com/chartjs/Chart.js",
  },
  {
    name: "SQLite",
    industry: "Relational database",
    founded: 2000,
    description:
      "SQLite is a self-contained, serverless, zero-configuration relational database engine that stores an entire database in a single file.",
    funFact:
      "SQLite's creator D. Richard Hipp also built Fossil, a distributed version control system, specifically to manage SQLite's own source code and development history.",
    icon: "/logos/sqlite.svg",
    aspect: 1,
    gitLink: "https://github.com/sqlite/sqlite",
  },
  {
    name: "Apache Hadoop",
    industry: "Distributed computing framework",
    founded: 2006,
    description:
      "Apache Hadoop is an open-source framework for distributed storage and processing of large datasets across clusters of computers.",
    funFact: "Hadoop is named after co-creator Doug Cutting's son's stuffed yellow elephant toy.",
    icon: "/logos/hadoop.svg",
    aspect: 1,
    gitLink: "https://github.com/apache/hadoop",
  },
  {
    name: "Faker",
    industry: "Fake data generator",
    founded: 2011,
    description:
      "Faker is a library that generates large amounts of realistic fake data, such as names, addresses, and emails, for testing and prototyping.",
    funFact:
      "Faker.js briefly disappeared from npm in 2022 after its original author intentionally sabotaged the package; the community immediately forked it as @faker-js/faker.",
    icon: "/logos/faker.svg",
    aspect: 0.831,
    gitLink: "https://github.com/faker-js/faker",
  },
  {
    name: "Fortran",
    industry: "Programming language",
    founded: 1957,
    description:
      "Fortran is one of the earliest high-level programming languages, designed for numeric and scientific computation.",
    funFact:
      "Fortran, short for 'Formula Translation', is considered the first widely used high-level programming language and is still used in scientific computing today.",
    icon: "/logos/fortran.svg",
    aspect: 1,
    gitLink: "https://github.com/fortran-lang/fortran-lang.org",
  },
  {
    name: "PouchDB",
    industry: "JavaScript database",
    founded: 2012,
    description:
      "PouchDB is a JavaScript database that runs in the browser and syncs with CouchDB-compatible servers to support offline-first applications.",
    funFact:
      "PouchDB takes its name as a nod to Couch (as in CouchDB) — a smaller, portable version you can carry in your 'pouch'.",
    icon: "/logos/pouchdb.svg",
    aspect: 0.776,
    gitLink: "https://github.com/pouchdb/pouchdb",
  },
  {
    name: "Redis",
    industry: "In-memory database",
    founded: 2009,
    description:
      "Redis is an open-source, in-memory data store used as a database, cache, and message broker, prized for its speed.",
    funFact:
      "Redis was created by Salvatore Sanfilippo to speed up a real-time web analytics startup he was building, and its name is short for 'Remote Dictionary Server'.",
    icon: "/logos/redis.svg",
    aspect: 1.164,
    gitLink: "https://github.com/redis/redis",
  },
  {
    name: "Headless UI",
    industry: "UI component library",
    founded: 2020,
    description:
      "Headless UI is a set of fully accessible, completely unstyled UI components designed to integrate with Tailwind CSS.",
    funFact:
      "Headless UI ships components with zero built-in styles at all, designed specifically to pair with Tailwind CSS for full visual control.",
    icon: "/logos/headlessui.svg",
    aspect: 1,
    gitLink: "https://github.com/tailwindlabs/headlessui",
  },
  {
    name: "Stencil",
    industry: "Web components compiler",
    founded: 2017,
    description:
      "Stencil is a compiler that generates standards-based Web Components from JSX and TypeScript, without requiring a runtime framework.",
    funFact:
      "Stencil was built by the Ionic team to compile familiar JSX and TypeScript components down into standards-based Web Components with no runtime framework required.",
    icon: "/logos/stencil.svg",
    aspect: 1.299,
    gitLink: "https://github.com/ionic-team/stencil",
  },
  {
    name: "Go",
    industry: "Programming language",
    founded: 2009,
    description:
      "Go is a statically typed, compiled programming language designed by Google for simplicity, fast compilation, and built-in concurrency.",
    funFact: "Go was designed at Google specifically to speed up compile times on the company's massive codebases, ditching many features of C++.",
    icon: "/logos/go.svg",
    aspect: 2.667,
    gitLink: "https://github.com/golang/go",
  },
  {
    name: "Kong",
    industry: "API gateway",
    founded: 2015,
    description:
      "Kong is an open-source API gateway and microservices management layer that handles traffic routing, authentication, and rate limiting.",
    funFact:
      "Kong grew out of Mashape's internal API gateway, built to manage traffic across the thousands of APIs listed on its own marketplace.",
    icon: "/logos/kong.svg",
    aspect: 1.138,
    gitLink: "https://github.com/Kong/kong",
  },
  {
    name: "D3.js",
    industry: "Data visualization",
    founded: 2011,
    description:
      "D3.js is a JavaScript library for producing dynamic, data-driven visualizations in web browsers using web standards like SVG and Canvas.",
    funFact: "D3 stands for Data-Driven Documents and was created by Mike Bostock as part of his PhD work at Stanford.",
    icon: "/logos/d3.svg",
    aspect: 1.053,
    gitLink: "https://github.com/d3/d3",
  },
  {
    name: "Reveal.js",
    industry: "Presentation framework",
    founded: 2011,
    description:
      "Reveal.js is an open-source framework for building HTML presentations, supporting transitions, themes, and Markdown-based slides.",
    funFact:
      "Reveal.js was created by Hakim El Hattab as a side project, and it has been used to present talks at conferences including TED and Google I/O.",
    icon: "/logos/reveal-js.svg",
    aspect: 1,
    gitLink: "https://github.com/hakimel/reveal.js",
  },
  {
    name: "Jenkins",
    industry: "CI/CD platform",
    founded: 2011,
    description:
      "Jenkins is an open-source automation server used to build, test, and deploy software through continuous integration and delivery pipelines.",
    funFact:
      "Jenkins began life as Hudson, but was renamed after a 2011 trademark dispute with Oracle, with the community picking a new name via an open vote.",
    icon: "/logos/jenkins.svg",
    aspect: 1,
    gitLink: "https://github.com/jenkinsci/jenkins",
  },
  {
    name: "Remix",
    industry: "React framework",
    founded: 2021,
    description:
      "Remix is a full-stack React framework focused on web standards, nested routing, and fast page loads through server rendering.",
    funFact: "Remix was built by Ryan Florence and Michael Jackson, the same duo behind React Router, and was later acquired by Shopify.",
    icon: "/logos/remix.svg",
    aspect: 0.862,
    gitLink: "https://github.com/remix-run/remix",
  },
  {
    name: "Meteor",
    industry: "Full-stack JavaScript framework",
    founded: 2012,
    description:
      "Meteor is a full-stack JavaScript platform for building web and mobile apps with real-time data syncing between client and server.",
    funFact:
      "Meteor pioneered 'full-stack reactivity', automatically syncing data changes from the server database straight through to the browser UI in real time.",
    icon: "/logos/meteor.svg",
    aspect: 1.02,
    gitLink: "https://github.com/meteor/meteor",
  },
  {
    name: "Prisma",
    industry: "TypeScript ORM",
    founded: 2016,
    description:
      "Prisma is a type-safe, next-generation ORM for Node.js and TypeScript that simplifies database access and migrations.",
    funFact:
      "Prisma originally shipped as a GraphQL-focused database layer before a full rewrite turned it into the type-safe ORM most developers know today.",
    icon: "/logos/prisma.svg",
    aspect: 0.826,
    gitLink: "https://github.com/prisma/prisma",
  },
  {
    name: "PrimeNG",
    industry: "UI component library",
    founded: 2016,
    description:
      "PrimeNG is a comprehensive UI component library for Angular, offering a wide range of pre-built, themeable components.",
    funFact:
      "PrimeNG is built by PrimeTek, the same team behind the long-running PrimeFaces and PrimeVue UI libraries for other frameworks, and was rewritten for the Angular 2+ era.",
    icon: "/logos/primeng.svg",
    aspect: 1,
    gitLink: "https://github.com/primefaces/primeng",
  },
  {
    name: "WordPress",
    industry: "Content management system",
    founded: 2003,
    description:
      "WordPress is an open-source content management system used to build and publish websites, blogs, and online stores.",
    funFact:
      "WordPress began in 2003 as a fork of an abandoned blogging tool called b2/cafelog, started by Matt Mullenweg and Mike Little.",
    icon: "/logos/wordpress.svg",
    aspect: 1,
    gitLink: "https://github.com/WordPress/WordPress",
  },
  {
    name: "Gatsby",
    industry: "Static site generator",
    founded: 2015,
    description:
      "Gatsby is a React-based framework for building fast static and server-rendered websites by pulling data from multiple sources into GraphQL.",
    funFact:
      "Gatsby was created by Kyle Mathews and Sam Bhagwat, and its name has no acronym or hidden meaning — they simply liked how it sounded.",
    icon: "/logos/gatsby.svg",
    aspect: 1,
    gitLink: "https://github.com/gatsbyjs/gatsby",
  },
  {
    name: "Nuxt",
    industry: "Vue framework",
    founded: 2016,
    description:
      "Nuxt is a full-stack framework built on Vue.js that adds server-side rendering, routing, and conventions for building web applications.",
    funFact: "Nuxt was directly inspired by Next.js, bringing the same convention-driven server-rendering approach to the Vue ecosystem.",
    icon: "/logos/nuxt.svg",
    aspect: 1.524,
    gitLink: "https://github.com/nuxt/nuxt",
  },
  {
    name: "React Hook Form",
    industry: "Form library",
    founded: 2019,
    description:
      "React Hook Form is a library for building performant, flexible forms in React with minimal re-renders and simple validation.",
    funFact:
      "React Hook Form was created by Bill Luo, who built it after noticing how much unnecessary re-rendering other form libraries caused in large React apps.",
    icon: "/logos/react-hook-form.svg",
    aspect: 1,
    gitLink: "https://github.com/react-hook-form/react-hook-form",
  },
  {
    name: "Vitest",
    industry: "Testing framework",
    founded: 2021,
    description:
      "Vitest is a fast unit testing framework built on top of Vite, sharing its configuration and transformation pipeline.",
    funFact:
      "Vitest was created by Anthony Fu and other Vite ecosystem contributors specifically because existing test runners couldn't reuse Vite's plugin pipeline.",
    icon: "/logos/vitest.svg",
    aspect: 1.094,
    gitLink: "https://github.com/vitest-dev/vitest",
  },
  {
    name: "Web Components",
    industry: "Web platform standard",
    founded: 2011,
    description:
      "Web Components is a set of browser standards, including Custom Elements and Shadow DOM, for building reusable, encapsulated HTML elements.",
    funFact:
      "Web Components was first proposed by Google's Alex Russell at the Fronteers Conference in 2011, bundling several separate specs, including Custom Elements, Shadow DOM, and HTML Templates, into one component model.",
    icon: "/logos/webcomponents.svg",
    aspect: 1.225,
    gitLink: "https://github.com/WICG/webcomponents",
  },
  {
    name: "SVG",
    industry: "Vector graphics format",
    founded: 2001,
    description:
      "SVG (Scalable Vector Graphics) is an XML-based markup format for describing two-dimensional vector graphics that scale without losing quality.",
    funFact:
      "SVG's XML-based design meant that, unlike earlier binary vector formats, an image could be opened as plain text and styled directly with CSS.",
    icon: "/logos/svg.svg",
    aspect: 1,
    gitLink: "https://github.com/w3c/svgwg",
  },
  {
    name: "Apache Cassandra",
    industry: "NoSQL database",
    founded: 2008,
    description:
      "Apache Cassandra is a distributed NoSQL database designed to handle large amounts of data across many commodity servers with no single point of failure.",
    funFact:
      "Cassandra was originally developed at Facebook to power its inbox search feature before being open-sourced in 2008.",
    icon: "/logos/cassandra.svg",
    aspect: 1,
    gitLink: "https://github.com/apache/cassandra",
  },
  {
    name: "Pulumi",
    industry: "Infrastructure as code",
    founded: 2017,
    description:
      "Pulumi is an infrastructure-as-code platform that lets developers define and manage cloud infrastructure using general-purpose programming languages.",
    funFact:
      "Pulumi was founded by Joe Duffy, who previously led Microsoft's Midori research OS project, so developers could write cloud infrastructure in general-purpose languages instead of a DSL like Terraform's HCL.",
    icon: "/logos/pulumi.svg",
    aspect: 1,
    gitLink: "https://github.com/pulumi/pulumi",
  },
  {
    name: "i18next",
    industry: "Internationalization framework",
    founded: 2011,
    description:
      "i18next is an internationalization framework for JavaScript that manages translations and localization across web and mobile applications.",
    funFact:
      "i18next was created by Jan Mühlemann and is designed so the exact same translation files and logic can be reused across browser, server, and mobile code.",
    icon: "/logos/i18next.svg",
    aspect: 1,
    gitLink: "https://github.com/i18next/i18next",
  },
  {
    name: "Cypress",
    industry: "End-to-end testing",
    founded: 2015,
    description:
      "Cypress is an end-to-end testing framework for web applications that runs tests directly inside the browser.",
    funFact:
      "Cypress runs tests directly inside the browser rather than driving it remotely, giving it native access to everything happening on the page.",
    icon: "/logos/cypress.svg",
    aspect: 1,
    gitLink: "https://github.com/cypress-io/cypress",
  },
  {
    name: "Playwright",
    industry: "End-to-end testing",
    founded: 2020,
    description:
      "Playwright is a browser automation and end-to-end testing framework that supports Chromium, Firefox, and WebKit from a single API.",
    funFact: "Playwright was built by many of the same engineers who created Puppeteer at Google, after they moved to Microsoft.",
    icon: "/logos/playwright.svg",
    aspect: 1.333,
    gitLink: "https://github.com/microsoft/playwright",
  },
  {
    name: "RSS",
    industry: "Web syndication format",
    founded: 1999,
    description:
      "RSS (Really Simple Syndication) is a web feed format used to publish frequently updated content like blog posts and news headlines.",
    funFact:
      "After Netscape's original 1999 RSS format was abandoned, Dave Winer's UserLand and an independent RSS-DEV working group each revived it separately, producing the rival 2.0 and 1.0 branches still in use today.",
    icon: "/logos/rss.svg",
    aspect: 1,
    gitLink: "https://github.com/w3c/feedvalidator",
  },
  {
    name: "Kubernetes",
    industry: "Container orchestration",
    founded: 2014,
    description:
      "Kubernetes is an open-source container orchestration platform for automating the deployment, scaling, and management of containerized applications.",
    funFact:
      "Kubernetes is based on Borg, the internal cluster manager Google had used for over a decade to run its own production workloads.",
    icon: "/logos/kubernetes.svg",
    aspect: 1.028,
    gitLink: "https://github.com/kubernetes/kubernetes",
  },
  {
    name: "Spring",
    industry: "Java framework",
    founded: 2003,
    description:
      "Spring is a comprehensive application framework for Java, built around dependency injection and used widely for enterprise software.",
    funFact:
      "Spring was created by Rod Johnson as a reaction against the complexity of Enterprise JavaBeans, built around simpler dependency injection instead.",
    icon: "/logos/spring.svg",
    aspect: 1,
    gitLink: "https://github.com/spring-projects/spring-framework",
  },
  {
    name: "Doctrine",
    industry: "PHP ORM",
    founded: 2006,
    description: "Doctrine is an object-relational mapping library and set of database tools for PHP applications.",
    funFact:
      "Doctrine's object-relational mapper was inspired directly by Hibernate, bringing the same 'Data Mapper' pattern from Java into the PHP ecosystem.",
    icon: "/logos/doctrine.svg",
    aspect: 0.755,
    gitLink: "https://github.com/doctrine/orm",
  },
  {
    name: "Ember.js",
    industry: "JavaScript framework",
    founded: 2011,
    description:
      "Ember.js is a JavaScript framework for building ambitious web applications, with strong conventions and built-in routing.",
    funFact: "Ember.js grew out of the earlier SproutCore project and was named by co-creator Yehuda Katz.",
    icon: "/logos/emberjs.svg",
    aspect: 1.002,
    gitLink: "https://github.com/emberjs/ember.js",
  },
  {
    name: "Ruby on Rails",
    industry: "Ruby web framework",
    founded: 2004,
    description:
      "Ruby on Rails is a full-stack web application framework for Ruby that emphasizes convention over configuration.",
    funFact:
      "Rails was extracted by David Heinemeier Hansson from the codebase of Basecamp, the project-management tool he was building at the agency then called 37signals.",
    icon: "/logos/rails.svg",
    aspect: 1,
    gitLink: "https://github.com/rails/rails",
  },
  {
    name: "WebGPU",
    industry: "Browser graphics API",
    founded: 2017,
    description:
      "WebGPU is a browser API that gives web pages low-level access to a device's GPU for graphics rendering and general-purpose computation.",
    funFact:
      "WebGPU was designed as a modern successor to WebGL, giving web pages low-level GPU access, including compute shaders, that mirrors native APIs like Vulkan, Metal, and Direct3D 12.",
    icon: "/logos/webgpu.svg",
    aspect: 1.225,
    gitLink: "https://github.com/gpuweb/gpuweb",
  },
  {
    name: "Sails.js",
    industry: "Node.js MVC framework",
    founded: 2012,
    description:
      "Sails.js is a Node.js MVC framework designed to build practical, production-ready APIs with an Express and Socket.IO foundation.",
    funFact:
      "Sails.js was created by Mike McNeil, who built it to give Node.js the kind of rapid, convention-driven scaffolding Rails offered Ruby developers.",
    icon: "/logos/sails.svg",
    aspect: 1,
    gitLink: "https://github.com/balderdashy/sails",
  },
  {
    name: "JUnit",
    industry: "Testing framework",
    founded: 1997,
    description:
      "JUnit is a widely used testing framework for Java that provides annotations and assertions for writing and running unit tests.",
    funFact:
      "Kent Beck and Erich Gamma wrote the first version of JUnit together during a plane flight, using the trip specifically to pair-program the framework.",
    icon: "/logos/junit.svg",
    aspect: 1,
    gitLink: "https://github.com/junit-team/junit5",
  },
  {
    name: "daisyUI",
    industry: "UI component library",
    founded: 2021,
    description:
      "daisyUI is a component library for Tailwind CSS that adds semantic class names like 'btn' and 'card' on top of utility classes.",
    funFact:
      "daisyUI was created by Iranian developer Pouya Saadeghi, who built it after growing tired of repeating the same long Tailwind utility strings across projects.",
    icon: "/logos/daisyui.svg",
    aspect: 1,
    gitLink: "https://github.com/saadeghi/daisyui",
  },
  {
    name: "Fresh",
    industry: "Web framework",
    founded: 2022,
    description:
      "Fresh is Deno's full-stack web framework, built around server-side rendering with island-based client hydration.",
    funFact:
      "Fresh is Deno's own web framework and ships zero JavaScript to the client by default, hydrating only the interactive 'islands' of a page.",
    icon: "/logos/fresh.svg",
    aspect: 1.185,
    gitLink: "https://github.com/denoland/fresh",
  },
  {
    name: "Swagger",
    industry: "API development tooling",
    founded: 2011,
    description:
      "Swagger is a set of tools for designing, building, and documenting REST APIs based on the OpenAPI Specification.",
    funFact: "Swagger was created by Tony Tam while working at Wordnik, reportedly named after his dog.",
    icon: "/logos/swagger.svg",
    aspect: 1,
    gitLink: "https://github.com/swagger-api/swagger-ui",
  },
  {
    name: "npm",
    industry: "Package manager",
    founded: 2010,
    description:
      "npm is the default package manager for Node.js and the world's largest registry of open-source JavaScript packages.",
    funFact:
      "npm was created by Isaac Z. Schafer and shipped bundled with Node.js, quickly becoming the largest software registry in the world by package count.",
    icon: "/logos/npmjs.svg",
    aspect: 1,
    gitLink: "https://github.com/npm/cli",
  },
  {
    name: "JSON",
    industry: "Data interchange format",
    founded: 2001,
    description:
      "JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format used widely for APIs and configuration.",
    funFact:
      "JSON was specified by Douglas Crockford, who extracted the format from a subset of JavaScript's own object-literal syntax rather than inventing something new.",
    icon: "/logos/json.svg",
    aspect: 1,
    gitLink: "https://github.com/douglascrockford/JSON-js",
  },
  {
    name: "MySQL",
    industry: "Relational database",
    founded: 1995,
    description: "MySQL is an open-source relational database management system widely used for web applications.",
    funFact: "MySQL is named after co-founder Michael Widenius's daughter, My, combined with the SQL query language.",
    icon: "/logos/mysql.svg",
    aspect: 1.016,
    gitLink: "https://github.com/mysql/mysql-server",
  },
  {
    name: "Vue.js",
    industry: "JavaScript framework",
    founded: 2014,
    description:
      "Vue.js is a progressive JavaScript framework for building user interfaces, designed to be incrementally adoptable.",
    funFact:
      "Vue was created by Evan You after working at Google, aiming to pull the best parts of Angular into something lighter.",
    icon: "/logos/vue.svg",
    aspect: 1.158,
    gitLink: "https://github.com/vuejs/core",
  },
  {
    name: "Grunt",
    industry: "Task runner",
    founded: 2012,
    description:
      "Grunt is a JavaScript task runner that automates repetitive build tasks like minification, compilation, and testing through configuration.",
    funFact:
      "Grunt was one of the first JavaScript task runners to popularize configuration-over-code build pipelines, before Gulp and npm scripts took over.",
    icon: "/logos/grunt.svg",
    aspect: 0.744,
    gitLink: "https://github.com/gruntjs/grunt",
  },
  {
    name: "WebSocket",
    industry: "Real-time communication protocol",
    founded: 2011,
    description:
      "WebSocket is a communication protocol that provides full-duplex, persistent connections between a browser and a server over a single TCP connection.",
    funFact:
      "WebSocket was standardized as RFC 6455 in 2011, giving browsers full-duplex, persistent connections instead of the endless HTTP polling hacks developers used before it.",
    icon: "/logos/websocket.svg",
    aspect: 1.326,
    gitLink: "https://github.com/whatwg/websockets",
  },
  {
    name: "Relay",
    industry: "GraphQL client",
    founded: 2015,
    description:
      "Relay is a JavaScript framework for building data-driven React applications with GraphQL, focused on performance and colocated data requirements.",
    funFact:
      "Relay was released by Facebook alongside GraphQL itself and pushed data-fetching logic down into individual React components rather than top-level pages.",
    icon: "/logos/relay.svg",
    aspect: 1.695,
    gitLink: "https://github.com/facebook/relay",
  },
  {
    name: "Ramda",
    industry: "Functional programming library",
    founded: 2013,
    description:
      "Ramda is a functional programming library for JavaScript that emphasizes pure functions, immutability, and automatic currying.",
    funFact:
      "Ramda's name and ram-themed logo play on FP jargon like 'lambda', chosen by creators Scott Sauyet and Michael Hurley as a memorable pun.",
    icon: "/logos/ramda.svg",
    aspect: 0.837,
    gitLink: "https://github.com/ramda/ramda",
  },
  {
    name: "RedwoodJS",
    industry: "Full-stack JavaScript framework",
    founded: 2020,
    description:
      "RedwoodJS is a full-stack JavaScript framework that combines React, GraphQL, and Prisma with opinionated conventions.",
    funFact:
      "RedwoodJS was created by Tom Preston-Werner, the co-founder of GitHub, aiming to bring Rails-like conventions to full-stack JavaScript apps.",
    icon: "/logos/redwoodjs.svg",
    aspect: 0.924,
    gitLink: "https://github.com/redwoodjs/redwood",
  },
  {
    name: "RabbitMQ",
    industry: "Message broker",
    founded: 2007,
    description:
      "RabbitMQ is an open-source message broker that implements the AMQP protocol to route messages between distributed applications.",
    funFact:
      "RabbitMQ implements the AMQP messaging protocol and was one of the first open-source message brokers built specifically around that open standard.",
    icon: "/logos/rabbitmq.svg",
    aspect: 0.996,
    gitLink: "https://github.com/rabbitmq/rabbitmq-server",
  },
  {
    name: "pnpm",
    industry: "Package manager",
    founded: 2017,
    description:
      "pnpm is a fast, disk-space-efficient package manager for JavaScript that uses a content-addressable store shared across projects.",
    funFact: "pnpm was created by Zoltan Kochan and its name literally stands for 'performant npm'.",
    icon: "/logos/pnpm.svg",
    aspect: 1,
    gitLink: "https://github.com/pnpm/pnpm",
  },
  {
    name: "Bitwarden",
    industry: "Password manager",
    founded: 2016,
    description:
      "Bitwarden is an open-source password manager for storing, generating, and syncing credentials across devices.",
    funFact:
      "Bitwarden started as a solo side project by Kyle Spearrin in 2015 after growing dissatisfied with LastPass, and launched publicly in 2016 with a commitment to staying fully open source.",
    icon: "/logos/bitwarden.svg",
    aspect: 0.835,
    gitLink: "https://github.com/bitwarden/server",
  },
  {
    name: "Highcharts",
    industry: "Charting library",
    founded: 2009,
    description:
      "Highcharts is a JavaScript charting library for creating interactive charts and graphs for web applications.",
    funFact:
      "Highcharts was created by Norwegian developer Torstein Hønsi after he couldn't find a charting library that met his own standards for a personal project.",
    icon: "/logos/highcharts.svg",
    aspect: 1.053,
    gitLink: "https://github.com/highcharts/highcharts",
  },
  {
    name: "Redux",
    industry: "State management library",
    founded: 2015,
    description:
      "Redux is a predictable state management library for JavaScript applications, commonly paired with React.",
    funFact:
      "Redux was created by Dan Abramov for a conference talk and was directly inspired by Facebook's Flux pattern combined with the functional reducer style of Elm.",
    icon: "/logos/redux.svg",
    aspect: 1.049,
    gitLink: "https://github.com/reduxjs/redux",
  },
  {
    name: "JWT",
    industry: "Authentication standard",
    founded: 2015,
    description:
      "JWT (JSON Web Token) is a compact, URL-safe token format used to securely transmit claims between two parties.",
    funFact:
      "JWT was standardized as RFC 7519, and its compact form is just three base64url-encoded segments (header, payload, and signature) joined by dots.",
    icon: "/logos/jwt.svg",
    aspect: 0.996,
    gitLink: "https://github.com/jwt",
  },
  {
    name: "GraphQL",
    industry: "Query language",
    founded: 2015,
    description:
      "GraphQL is a query language and runtime for APIs that lets clients request exactly the data they need.",
    funFact:
      "GraphQL was developed internally at Facebook in 2012 to power its mobile apps and wasn't publicly open-sourced until three years later.",
    icon: "/logos/graphql.svg",
    aspect: 0.889,
    gitLink: "https://github.com/graphql/graphql-spec",
  },
  {
    name: "Handlebars",
    industry: "Templating engine",
    founded: 2010,
    description:
      "Handlebars is a templating engine that generates HTML from templates and data by extending Mustache's logic-less syntax with helpers.",
    funFact:
      "Handlebars takes its name from the curly-brace {{ }} syntax used in its templates, which its creators thought resembled a pair of handlebars.",
    icon: "/logos/handlebars.svg",
    aspect: 4.129,
    gitLink: "https://github.com/handlebars-lang/handlebars.js",
  },
  {
    name: "SolidJS",
    industry: "JavaScript framework",
    founded: 2018,
    description:
      "SolidJS is a declarative JavaScript framework for building user interfaces using fine-grained reactivity instead of a virtual DOM.",
    funFact:
      "SolidJS was created by Ryan Carniato and compiles JSX directly into real DOM updates using fine-grained reactivity, skipping the virtual DOM that frameworks like React rely on.",
    icon: "/logos/solidjs.svg",
    aspect: 1,
    gitLink: "https://github.com/solidjs/solid",
  },
  {
    name: "Flow",
    industry: "Static type checker",
    founded: 2014,
    description: "Flow is a static type checker for JavaScript that catches type errors before code runs.",
    funFact:
      "Flow was built at Facebook to add static typing to JavaScript years before TypeScript became the dominant choice for typed React codebases.",
    icon: "/logos/flow.svg",
    aspect: 0.959,
    gitLink: "https://github.com/facebook/flow",
  },
  {
    name: "Markdown",
    industry: "Markup language",
    founded: 2004,
    description: "Markdown is a lightweight markup language that converts plain-text formatting into HTML.",
    funFact:
      "Markdown was created in 2004 by John Gruber with help from Aaron Swartz, who had already built a similar plain-text markup language called atx and helped shape features like the '#' heading syntax.",
    icon: "/logos/markdown.svg",
    aspect: 1.62,
    gitLink: "https://github.com/mundimark/markdown.pl",
  },
  {
    name: "Crystal",
    industry: "Programming language",
    founded: 2014,
    description:
      "Crystal is a general-purpose, statically typed programming language with Ruby-like syntax that compiles to efficient native code.",
    funFact: "Crystal compiles to native code but reads almost like Ruby, a deliberate design goal of its creators.",
    icon: "/logos/crystal.svg",
    aspect: 1,
    gitLink: "https://github.com/crystal-lang/crystal",
  },
  {
    name: "Marko",
    industry: "JavaScript framework",
    founded: 2014,
    description: "Marko is a fast, HTML-based UI language and compiler optimized for server-side rendering.",
    funFact: "Marko was built at eBay specifically to speed up server-side rendering for its own high-traffic commerce pages.",
    icon: "/logos/marko.svg",
    aspect: 1.816,
    gitLink: "https://github.com/marko-js/marko",
  },
  {
    name: "Valibot",
    industry: "Schema validation library",
    founded: 2023,
    description:
      "Valibot is a schema validation library for TypeScript and JavaScript, built for small bundle size through modular, tree-shakable validators.",
    funFact:
      "Valibot began as part of creator Fabian Hiller's university thesis and was designed around a modular API so unused validators can be tree-shaken out entirely.",
    icon: "/logos/valibot.svg",
    aspect: 1,
    gitLink: "https://github.com/fabian-hiller/valibot",
  },
  {
    name: "Elm",
    industry: "Programming language",
    founded: 2012,
    description:
      "Elm is a functional programming language that compiles to JavaScript, designed for building reliable front-end web applications.",
    funFact:
      "Elm was created by Evan Czaplicki as his senior thesis project at Harvard, aiming to bring the reliability of functional programming to front-end web development.",
    icon: "/logos/elm.svg",
    aspect: 1,
    gitLink: "https://github.com/elm/compiler",
  },
  {
    name: "ESLint",
    industry: "JavaScript linter",
    founded: 2013,
    description:
      "ESLint is a pluggable JavaScript and TypeScript linter that identifies and enforces coding rules and style conventions.",
    funFact:
      "ESLint was created by Nicholas C. Zakas specifically so every linting rule could be individually enabled, disabled, or written as a plugin.",
    icon: "/logos/eslint.svg",
    aspect: 1.138,
    gitLink: "https://github.com/eslint/eslint",
  },
  {
    name: "MUI",
    industry: "UI component library",
    founded: 2014,
    description: "MUI is a React component library that implements Google's Material Design guidelines.",
    funFact:
      "MUI (originally Material-UI) began as one of the first React libraries to fully implement Google's then-new Material Design guidelines.",
    icon: "/logos/material-ui.svg",
    aspect: 1.153,
    gitLink: "https://github.com/mui/material-ui",
  },
  {
    name: "Kibana",
    industry: "Data visualization",
    founded: 2013,
    description: "Kibana is a data visualization and exploration tool for data stored in Elasticsearch.",
    funFact:
      "Kibana was created as a side project to visualize logs stored in Elasticsearch before becoming an official part of Elastic's product line.",
    icon: "/logos/kibana.svg",
    aspect: 0.78,
    gitLink: "https://github.com/elastic/kibana",
  },
  {
    name: "RxJS",
    industry: "Reactive programming library",
    founded: 2010,
    description:
      "RxJS is a library for reactive programming in JavaScript using observables to compose asynchronous and event-based code.",
    funFact:
      "RxJS brings the ReactiveX pattern, originally developed at Microsoft for .NET, into JavaScript by modeling asynchronous events as composable streams.",
    icon: "/logos/rxjs.svg",
    aspect: 0.965,
    gitLink: "https://github.com/ReactiveX/rxjs",
  },
  {
    name: "esbuild",
    industry: "JavaScript bundler",
    founded: 2020,
    description: "esbuild is an extremely fast JavaScript and TypeScript bundler and minifier written in Go.",
    funFact:
      "esbuild was written from scratch in Go by Evan Wallace, co-founder of Figma, to prove that JavaScript bundlers could be orders of magnitude faster.",
    icon: "/logos/esbuild.svg",
    aspect: 1,
    gitLink: "https://github.com/evanw/esbuild",
  },
  {
    name: "SonarCloud",
    industry: "Code quality platform",
    founded: 2016,
    description:
      "SonarCloud is a cloud-based static code analysis service that scans code for bugs, vulnerabilities, and quality issues.",
    funFact:
      "SonarCloud is the cloud-hosted counterpart to SonarQube, built by SonarSource to run static analysis directly inside CI pipelines.",
    icon: "/logos/sonarcloud.svg",
    aspect: 1.103,
    gitLink: "https://github.com/SonarSource/sonarqube",
  },
  {
    name: "Docker",
    industry: "Containerization platform",
    founded: 2013,
    description:
      "Docker is a platform for building, packaging, and running applications in lightweight, portable containers.",
    funFact:
      "Docker began as an internal tool at the PaaS company dotCloud before being spun out and open-sourced, popularizing containers industry-wide.",
    icon: "/logos/docker.svg",
    aspect: 1.384,
    gitLink: "https://github.com/docker/docker-ce",
  },
  {
    name: "SonarQube",
    industry: "Code quality platform",
    founded: 2007,
    description:
      "SonarQube is a self-hosted platform for continuous inspection of code quality, detecting bugs, vulnerabilities, and code smells.",
    funFact:
      "SonarQube was started by Simon Brandhof in 2007 to unify a handful of fragmented open-source Java code-quality tools into a single platform, before expanding to cover 30+ languages.",
    icon: "/logos/sonarqube.svg",
    aspect: 1,
    gitLink: "https://github.com/SonarSource/sonarqube",
  },
  {
    name: "Laravel",
    industry: "PHP framework",
    founded: 2011,
    description:
      "Laravel is a PHP web application framework with expressive syntax, built-in tools for routing, authentication, and database migrations.",
    funFact:
      "Laravel was created by Taylor Otwell as a more expressive alternative to CodeIgniter, which lacked built-in support for things like authentication.",
    icon: "/logos/laravel.svg",
    aspect: 0.97,
    gitLink: "https://github.com/laravel/laravel",
  },
  {
    name: "DynamoDB",
    industry: "NoSQL database",
    founded: 2012,
    description:
      "DynamoDB is a fully managed NoSQL key-value and document database service offered by Amazon Web Services.",
    funFact:
      "DynamoDB grew out of a 2007 Amazon whitepaper describing the original internal Dynamo system, before being rebuilt and launched as a fully managed public service in 2012.",
    icon: "/logos/dynamodb.svg",
    aspect: 1,
    gitLink: "https://github.com/aws",
  },
  {
    name: "Jest",
    industry: "Testing framework",
    founded: 2011,
    description:
      "Jest is a JavaScript testing framework focused on simplicity, with built-in assertions, mocking, and snapshot testing.",
    funFact:
      "Jest was originally built at Facebook to test JavaScript at scale and popularized snapshot testing as a way to catch unintended UI changes.",
    icon: "/logos/jest.svg",
    aspect: 0.905,
    gitLink: "https://github.com/jestjs/jest",
  },
  {
    name: "Thymeleaf",
    industry: "Java templating engine",
    founded: 2011,
    description:
      "Thymeleaf is a server-side Java templating engine that processes HTML, XML, and other document formats.",
    funFact:
      "Thymeleaf templates are valid HTML that can be opened and previewed directly in a browser, even before the templating engine ever processes them.",
    icon: "/logos/thymeleaf.svg",
    aspect: 0.996,
    gitLink: "https://github.com/thymeleaf/thymeleaf",
  },
  {
    name: "Apollo Client",
    industry: "GraphQL client",
    founded: 2016,
    description:
      "Apollo Client is a comprehensive state management library for JavaScript that manages both local and remote data with GraphQL.",
    funFact:
      "Apollo grew out of the Meteor Development Group, which pivoted its entire company focus from the Meteor framework to GraphQL tooling.",
    icon: "/logos/apollographql.svg",
    aspect: 1,
    gitLink: "https://github.com/apollographql/apollo-client",
  },
  {
    name: "Renovate",
    industry: "Dependency automation",
    founded: 2017,
    description:
      "Renovate is an automated dependency update tool that scans repositories and opens pull requests to keep dependencies current.",
    funFact:
      "Renovate was created as an independent open-source project by Rhys Arkins before being acquired by WhiteSource (now Mend) in 2019.",
    icon: "/logos/renovate.svg",
    aspect: 1,
    gitLink: "https://github.com/renovatebot/renovate",
  },
  {
    name: "NgRx",
    industry: "State management library",
    founded: 2016,
    description:
      "NgRx is a framework for building reactive applications in Angular using Redux-inspired state management built on RxJS.",
    funFact:
      "NgRx started as a small experiment by Rob Wormald, Mike Ryan, and Brandon Roberts to bring Redux-style state management to Angular during the Angular 2 rewrite.",
    icon: "/logos/ngrx.svg",
    aspect: 1,
    gitLink: "https://github.com/ngrx/platform",
  },
  {
    name: "Clerk",
    industry: "Authentication platform",
    founded: 2019,
    description:
      "Clerk is an authentication and user management platform that provides prebuilt UI components and APIs for sign-in and account management.",
    funFact:
      "Clerk was founded in 2019 by brothers Colin and Braden Sidoti and ships prebuilt, fully styled UI components for sign-in and user management.",
    icon: "/logos/clerk.svg",
    aspect: 1,
    gitLink: "https://github.com/clerk/javascript",
  },
  {
    name: "Better Auth",
    industry: "Authentication library",
    founded: 2024,
    description:
      "Better Auth is a framework-agnostic, self-hosted authentication library for TypeScript applications, built around a plugin system.",
    funFact:
      "Better Auth was created by developer Bereket Engida as a direct response to frustration with the limitations of existing TypeScript auth libraries.",
    icon: "/logos/better-auth.svg",
    aspect: 1,
    gitLink: "https://github.com/better-auth/better-auth",
  },
  {
    name: "Pinia",
    industry: "State management library",
    founded: 2019,
    description: "Pinia is the official state management library for Vue, offering a simple, type-safe store API.",
    funFact:
      "Pinia started as an experiment testing what a Vue 3 store API could look like, and was later adopted as Vue's official replacement for Vuex.",
    icon: "/logos/pinia.svg",
    aspect: 0.773,
    gitLink: "https://github.com/vuejs/pinia",
  },
  {
    name: "PixiJS",
    industry: "2D rendering engine",
    founded: 2013,
    description:
      "PixiJS is a fast, GPU-accelerated 2D rendering engine for the web, used for graphics, games, and interactive visuals.",
    funFact:
      "PixiJS was created by Mat Groves and the Goodboy Digital team in 2013 with a focus on making fast, GPU-accelerated 2D rendering accessible in the browser.",
    icon: "/logos/pixijs.svg",
    aspect: 1,
    gitLink: "https://github.com/pixijs/pixijs",
  },
  {
    name: "Selenium",
    industry: "Browser automation framework",
    founded: 2004,
    description:
      "Selenium is a suite of tools for automating web browsers, widely used for browser testing and web scraping.",
    funFact:
      "Selenium got its name as a joking jab at a rival commercial testing tool called Mercury: selenium is a chemical antidote to mercury poisoning.",
    icon: "/logos/selenium.svg",
    aspect: 1,
    gitLink: "https://github.com/SeleniumHQ/selenium",
  },
  {
    name: "Symfony",
    industry: "PHP framework",
    founded: 2005,
    description:
      "Symfony is a PHP web application framework and a set of reusable PHP components used across many other PHP projects.",
    funFact: "Symfony's reusable components ended up powering large parts of other major PHP projects, including Laravel and Drupal.",
    icon: "/logos/symfony.svg",
    aspect: 0.996,
    gitLink: "https://github.com/symfony/symfony",
  },
  {
    name: "DuckDB",
    industry: "Analytical database",
    founded: 2019,
    description:
      "DuckDB is an in-process analytical database engine designed to run complex analytical queries directly inside an application.",
    funFact:
      "DuckDB is an in-process analytical database often described as 'SQLite for analytics', designed to run complex queries directly inside an application with no separate server.",
    icon: "/logos/duckdb.svg",
    aspect: 1,
    gitLink: "https://github.com/duckdb/duckdb",
  },
  {
    name: "Bulma",
    industry: "CSS framework",
    founded: 2016,
    description:
      "Bulma is an open-source CSS framework based on Flexbox, providing responsive layout and styling with no JavaScript.",
    funFact:
      "Bulma was created by Swiss developer Jeremy Thomas and deliberately ships zero JavaScript, leaving all interactivity decisions entirely to the developer.",
    icon: "/logos/bulma.svg",
    aspect: 1,
    gitLink: "https://github.com/jgthms/bulma",
  },
  {
    name: "shadcn/ui",
    industry: "UI component library",
    founded: 2023,
    description:
      "shadcn/ui is a collection of accessible, customizable React components whose source code is copied directly into a project rather than installed as a package.",
    funFact:
      "shadcn/ui isn't installed as a package at all — its CLI copies component source code directly into your project so you can freely edit every line.",
    icon: "/logos/shadcn-ui.svg",
    aspect: 1,
    gitLink: "https://github.com/shadcn-ui/ui",
  },
  {
    name: "Auth0",
    industry: "Identity platform",
    founded: 2013,
    description:
      "Auth0 is an identity platform that provides authentication and authorization services for web, mobile, and API applications.",
    funFact:
      "Auth0 was founded by longtime friends Eugenio Pace and Matias Woloski while living 7,000 miles apart in Seattle and Buenos Aires, and was later acquired by Okta for $6.5 billion.",
    icon: "/logos/auth0.svg",
    aspect: 0.898,
    gitLink: "https://github.com/auth0",
  },
  {
    name: "Sequelize",
    industry: "Node.js ORM",
    founded: 2010,
    description:
      "Sequelize is a promise-based Node.js ORM that supports Postgres, MySQL, MariaDB, SQLite, and SQL Server through a single API.",
    funFact:
      "Sequelize's mascot and name riff on 'sequel', the common pronunciation of SQL, hinting at the multiple SQL dialects it papers over with one API.",
    icon: "/logos/sequelize.svg",
    aspect: 1,
    gitLink: "https://github.com/sequelize/sequelize",
  },
  {
    name: "Storybook",
    industry: "UI development environment",
    founded: 2016,
    description:
      "Storybook is a frontend workshop tool for building, testing, and documenting UI components in isolation from an application.",
    funFact:
      "Storybook began in 2016 as an internal tool at a startup called Storyful before being open-sourced and eventually becoming an independent, widely funded project.",
    icon: "/logos/storybook.svg",
    aspect: 0.803,
    gitLink: "https://github.com/storybookjs/storybook",
  },
  {
    name: "Supabase",
    industry: "Backend-as-a-service",
    founded: 2020,
    description:
      "Supabase is an open-source backend-as-a-service platform built on PostgreSQL, providing a database, authentication, storage, and edge functions.",
    funFact:
      "Supabase was built explicitly as an open-source alternative to Firebase, but on top of PostgreSQL instead of a proprietary NoSQL database.",
    icon: "/logos/supabase.svg",
    aspect: 0.973,
    gitLink: "https://github.com/supabase/supabase",
  },
  {
    name: "Semantic UI",
    industry: "UI component library",
    founded: 2013,
    description:
      "Semantic UI is a front-end framework that uses human-readable class names to build responsive, themeable interfaces.",
    funFact:
      "Semantic UI was built around human-readable class names like 'ui button' instead of terse utility abbreviations, aiming for markup that reads like English.",
    icon: "/logos/semantic-ui.svg",
    aspect: 1,
    gitLink: "https://github.com/Semantic-Org/Semantic-UI",
  },
  {
    name: "Tailwind CSS",
    industry: "Utility-first CSS framework",
    founded: 2017,
    description:
      "Tailwind CSS is a utility-first CSS framework that provides low-level classes for building custom designs directly in markup.",
    funFact:
      "Tailwind CSS was created by Adam Wathan after he kept rebuilding the same set of utility classes across different client projects.",
    icon: "/logos/tailwindcss.svg",
    aspect: 1.662,
    gitLink: "https://github.com/tailwindlabs/tailwindcss",
  },
  {
    name: "Panda CSS",
    industry: "CSS-in-JS framework",
    founded: 2023,
    description:
      "Panda CSS is a CSS-in-JS styling engine that statically extracts styles at build time instead of generating them at runtime.",
    funFact:
      "Panda CSS was built by Chakra UI's creator Segun Adebayo to statically extract styles at build time instead of generating them at runtime.",
    icon: "/logos/pandacss.svg",
    aspect: 0.988,
    gitLink: "https://github.com/chakra-ui/panda",
  },
  {
    name: "PrimeVue",
    industry: "UI component library",
    founded: 2018,
    description:
      "PrimeVue is a UI component library for Vue.js offering a large collection of themeable, accessible components.",
    funFact:
      "PrimeVue is built by PrimeTek, the same team behind the long-running PrimeFaces and PrimeNG UI libraries for other frameworks.",
    icon: "/logos/primevue.svg",
    aspect: 1,
    gitLink: "https://github.com/primefaces/primevue",
  },
  {
    name: "CoffeeScript",
    industry: "Programming language",
    founded: 2009,
    description:
      "CoffeeScript is a programming language that compiles into readable JavaScript, adding syntactic sugar inspired by Ruby and Python.",
    funFact:
      "CoffeeScript was created by Jeremy Ashkenas to compile down to clean, readable JavaScript, popularizing syntax ideas that later influenced ES6.",
    icon: "/logos/coffeescript.svg",
    aspect: 1,
    gitLink: "https://github.com/jashkenas/coffeescript",
  },
  {
    name: "Rollup",
    industry: "JavaScript bundler",
    founded: 2015,
    description:
      "Rollup is a JavaScript module bundler that compiles small pieces of code into a larger, optimized bundle using ES modules.",
    funFact:
      "Rollup was created by Rich Harris and was one of the first bundlers built around ES modules, popularizing 'tree-shaking' to strip out unused code.",
    icon: "/logos/rollupjs.svg",
    aspect: 0.764,
    gitLink: "https://github.com/rollup/rollup",
  },
  {
    name: "Keycloak",
    industry: "Identity and access management",
    founded: 2014,
    description:
      "Keycloak is an open-source identity and access management solution providing single sign-on, authentication, and authorization.",
    funFact:
      "Keycloak, built at Red Hat, later became the upstream project for Red Hat's own SSO product, which was fully rebranded as Red Hat build of Keycloak in 2023.",
    icon: "/logos/keycloak.svg",
    aspect: 1.113,
    gitLink: "https://github.com/keycloak/keycloak",
  },
  {
    name: "Gradle",
    industry: "Build automation tool",
    founded: 2007,
    description:
      "Gradle is a build automation tool that manages dependencies and builds projects using a Groovy or Kotlin-based configuration.",
    funFact:
      "Gradle combined the flexibility of Ant with the dependency management of Maven, using Groovy (and later Kotlin) scripts instead of rigid XML.",
    icon: "/logos/gradle.svg",
    aspect: 1.362,
    gitLink: "https://github.com/gradle/gradle",
  },
  {
    name: "UnoCSS",
    industry: "Atomic CSS engine",
    founded: 2021,
    description:
      "UnoCSS is an instant, on-demand atomic CSS engine that generates utility classes from configurable preset rules.",
    funFact:
      "UnoCSS was created by Anthony Fu, and its name is a pun on being the 'number one' (uno) engine that can emulate almost any other utility-CSS framework.",
    icon: "/logos/unocss.svg",
    aspect: 1,
    gitLink: "https://github.com/unocss/unocss",
  },
  {
    name: "Atomico",
    industry: "Web components library",
    founded: 2018,
    description: "Atomico is a library for building native Web Components using hooks, JSX, and a virtual DOM.",
    funFact:
      "Atomico's name is Spanish for 'atomic', reflecting its goal of building interfaces from small, atomic functional components.",
    icon: "/logos/atomicojs.svg",
    aspect: 0.996,
    gitLink: "https://github.com/atomicojs/atomico",
  },
  {
    name: "webpack",
    industry: "JavaScript bundler",
    founded: 2012,
    description:
      "webpack is a static module bundler for JavaScript applications that builds a dependency graph and packages assets for the browser.",
    funFact:
      "webpack popularized treating every asset, including CSS, images, and fonts, as a module that JavaScript could require() directly, code-splitting them on demand.",
    icon: "/logos/webpack.svg",
    aspect: 1,
    gitLink: "https://github.com/webpack/webpack",
  },
  {
    name: "Kotlin",
    industry: "Programming language",
    founded: 2011,
    description:
      "Kotlin is a statically typed programming language that runs on the JVM and is fully interoperable with Java.",
    funFact: "Kotlin is named after Kotlin Island near St. Petersburg, echoing Java's own naming after the island of Java.",
    icon: "/logos/kotlin.svg",
    aspect: 1,
    gitLink: "https://github.com/JetBrains/kotlin",
  },
  {
    name: "Vuetify",
    industry: "UI component library",
    founded: 2016,
    description: "Vuetify is a Material Design component framework for Vue.js applications.",
    funFact: "Vuetify was one of the first component frameworks to fully implement Google's Material Design spec for Vue.",
    icon: "/logos/vuetifyjs.svg",
    aspect: 1.153,
    gitLink: "https://github.com/vuetifyjs/vuetify",
  },
  {
    name: "NestJS",
    industry: "Node.js framework",
    founded: 2017,
    description:
      "NestJS is a Node.js framework for building efficient, scalable server-side applications using TypeScript and a modular, Angular-inspired architecture.",
    funFact:
      "NestJS was created by Kamil Myśliwiec, who deliberately borrowed Angular's decorator-and-module architecture to bring familiar structure to Node.js backends.",
    icon: "/logos/nestjs.svg",
    aspect: 1.004,
    gitLink: "https://github.com/nestjs/nest",
  },
  {
    name: "Astro",
    industry: "Web framework",
    founded: 2021,
    description:
      "Astro is a web framework for building fast, content-focused websites that ships minimal JavaScript by default.",
    funFact:
      "Astro pioneered the 'islands architecture' pattern, shipping zero JavaScript by default and hydrating only the individual components that need interactivity.",
    icon: "/logos/astro.svg",
    aspect: 1,
    gitLink: "https://github.com/withastro/astro",
  },
  {
    name: "Gatling",
    industry: "Load testing tool",
    founded: 2012,
    description:
      "Gatling is a load and performance testing tool for applications, APIs, and microservices, built on Scala and Akka.",
    funFact:
      "Gatling is named after the Gatling gun, the rapid-fire weapon, as a nod to its ability to fire off massive volumes of simulated requests.",
    icon: "/logos/gatling.svg",
    aspect: 1,
    gitLink: "https://github.com/gatling/gatling",
  },
  {
    name: "Ansible",
    industry: "IT automation tool",
    founded: 2012,
    description:
      "Ansible is an open-source IT automation tool used for configuration management, application deployment, and orchestration.",
    funFact:
      "Ansible is named after the fictional instantaneous communication device from Ursula K. Le Guin's science fiction novels.",
    icon: "/logos/ansible.svg",
    aspect: 1,
    gitLink: "https://github.com/ansible/ansible",
  },
  {
    name: "Apache CouchDB",
    industry: "NoSQL database",
    founded: 2005,
    description:
      "Apache CouchDB is a NoSQL document database that uses JSON for documents and HTTP as its native API.",
    funFact:
      "CouchDB was created by former Lotus Notes developer Damien Katz and uses HTTP and JSON natively as its query interface.",
    icon: "/logos/couchdb.svg",
    aspect: 1,
    gitLink: "https://github.com/apache/couchdb",
  },
  {
    name: "Haskell",
    industry: "Programming language",
    founded: 1990,
    description:
      "Haskell is a purely functional programming language with strong static typing and lazy evaluation.",
    funFact: "Haskell is named after the logician Haskell Curry, whose work also inspired the term 'currying'.",
    icon: "/logos/haskell.svg",
    aspect: 1.414,
    gitLink: "https://github.com/ghc/ghc",
  },
  {
    name: "Auth.js",
    industry: "Authentication library",
    founded: 2020,
    description:
      "Auth.js is an open-source authentication library for JavaScript applications, supporting many frameworks and identity providers.",
    funFact:
      "Auth.js began life as NextAuth.js, built specifically for Next.js in 2020, before expanding to support other frameworks like SvelteKit and Express and being renamed accordingly.",
    icon: "/logos/auth-js.svg",
    aspect: 0.905,
    gitLink: "https://github.com/nextauthjs/next-auth",
  },
  {
    name: "Babylon.js",
    industry: "3D graphics library",
    founded: 2013,
    description: "Babylon.js is a real-time 3D graphics engine for the web, built on WebGL and WebGPU.",
    funFact: "Babylon.js was created by Microsoft engineer David Catuhe as a real-time 3D engine built entirely on WebGL.",
    icon: "/logos/babylonjs.svg",
    aspect: 1,
    gitLink: "https://github.com/BabylonJS/Babylon.js",
  },
  {
    name: "Quarkus",
    industry: "Java framework",
    founded: 2019,
    description:
      "Quarkus is a Kubernetes-native Java framework tailored for fast startup times and low memory usage in containers and serverless environments.",
    funFact:
      "Quarkus brands itself 'Supersonic Subatomic Java' and was built by Red Hat specifically to shrink Java's startup time and memory footprint for containers and serverless.",
    icon: "/logos/quarkus.svg",
    aspect: 1,
    gitLink: "https://github.com/quarkusio/quarkus",
  },
  {
    name: "Railway",
    industry: "Deployment platform",
    founded: 2020,
    description:
      "Railway is a cloud deployment platform that lets developers deploy applications, databases, and services directly from a GitHub repository.",
    funFact:
      "Railway grew out of a project originally called 'CtrlPanel', rebranding before its public launch to reflect its focus on deploying straight from a repository.",
    icon: "/logos/railway.svg",
    aspect: 1,
    gitLink: "https://github.com/railwayapp",
  },
  {
    name: "Qwik",
    industry: "JavaScript framework",
    founded: 2021,
    description:
      "Qwik is a JavaScript framework built around resumability, designed to ship minimal JavaScript until a user interacts with the page.",
    funFact:
      "Qwik was created by Angular co-creator Miško Hevery around the idea of 'resumability', shipping almost no JavaScript until a user actually interacts with the page.",
    icon: "/logos/qwik.svg",
    aspect: 0.941,
    gitLink: "https://github.com/QwikDev/qwik",
  },
  {
    name: "Effect",
    industry: "Programming library",
    founded: 2021,
    description:
      "Effect is a TypeScript library for building robust applications using a fully typed, composable effect system.",
    funFact:
      "Effect was created by Michael Arnaldi and originally distributed under the name '@effect-ts/core' before consolidating into today's single Effect package.",
    icon: "/logos/effect.svg",
    aspect: 1,
    gitLink: "https://github.com/Effect-TS/effect",
  },
  {
    name: "Zend Framework",
    industry: "PHP framework",
    founded: 2006,
    description:
      "Zend Framework is an open-source, object-oriented PHP framework used for building web applications and services.",
    funFact:
      "Zend is a portmanteau of founders Zeev Suraski and Andi Gutmans' first names, the same two engineers who had already built the Zend Engine that powers PHP itself.",
    icon: "/logos/zend.svg",
    aspect: 1,
    gitLink: "https://github.com/zendframework/zendframework",
  },
  {
    name: "Inferno",
    industry: "JavaScript library",
    founded: 2016,
    description:
      "Inferno is a JavaScript library for building fast user interfaces, similar in API to React but optimized for raw rendering speed.",
    funFact:
      "Inferno was built by Dominic Gannaway with a laser focus on raw rendering speed, at one point benchmarking as the fastest of all major virtual DOM libraries.",
    icon: "/logos/inferno.svg",
    aspect: 0.962,
    gitLink: "https://github.com/infernojs/inferno",
  },
  {
    name: "Flutter",
    industry: "Cross-platform UI framework",
    founded: 2017,
    description:
      "Flutter is a UI toolkit from Google for building natively compiled applications for mobile, web, and desktop from a single codebase.",
    funFact:
      "Flutter was internally codenamed 'Sky' at Google before its public unveiling, and it renders every pixel with its own engine so apps look identical on iOS and Android.",
    icon: "/logos/flutter.svg",
    aspect: 0.808,
    gitLink: "https://github.com/flutter/flutter",
  },
  {
    name: "htmx",
    industry: "Hypermedia library",
    founded: 2020,
    description:
      "htmx is a library that lets developers access AJAX, WebSockets, and Server-Sent Events directly through HTML attributes.",
    funFact:
      "htmx grew out of an earlier jQuery-based library called intercooler.js, rewritten from scratch to let plain HTML attributes trigger AJAX, WebSockets, and more.",
    icon: "/logos/htmx.svg",
    aspect: 1.524,
    gitLink: "https://github.com/bigskysoftware/htmx",
  },
  {
    name: "Postman",
    industry: "API development platform",
    founded: 2014,
    description: "Postman is an API development platform for building, testing, and documenting APIs.",
    funFact:
      "Postman began as a side-project Chrome extension built by Abhinav Asthana to make testing APIs easier than using raw curl commands.",
    icon: "/logos/postman.svg",
    aspect: 1,
    gitLink: "https://github.com/postmanlabs",
  },
  {
    name: "Elixir",
    industry: "Programming language",
    founded: 2012,
    description:
      "Elixir is a functional, concurrent programming language built on the Erlang VM, designed for scalable and fault-tolerant applications.",
    funFact:
      "Elixir was created by José Valim, a former Ruby on Rails core team member, to bring Erlang's concurrency and fault-tolerance to a more approachable syntax.",
    icon: "/logos/elixir.svg",
    aspect: 1,
    gitLink: "https://github.com/elixir-lang/elixir",
  },
  {
    name: "Inertia.js",
    industry: "Full-stack framework glue",
    founded: 2019,
    description:
      "Inertia.js is a library that lets developers build single-page applications using classic server-side routing and controllers.",
    funFact:
      "Inertia.js was inspired by Turbolinks and lets developers build single-page apps using classic server-side routing and controllers from frameworks like Laravel and Rails, without building a separate API.",
    icon: "/logos/inertiajs.svg",
    aspect: 1,
    gitLink: "https://github.com/inertiajs/inertia",
  },
  {
    name: "AdonisJS",
    industry: "Node.js framework",
    founded: 2015,
    description:
      "AdonisJS is a Node.js MVC framework with a built-in ORM, offering a full-featured structure for building web applications and APIs.",
    funFact:
      "AdonisJS was created by Harminder Virk and was one of the first Node.js frameworks to ship a full MVC structure with a built-in ORM, drawing heavily on Laravel's conventions.",
    icon: "/logos/adonisjs.svg",
    aspect: 1,
    gitLink: "https://github.com/adonisjs/core",
  },
  {
    name: "Hibernate",
    industry: "Java ORM",
    founded: 2001,
    description:
      "Hibernate is an object-relational mapping framework for Java that simplifies database access and persistence.",
    funFact:
      "Hibernate was created by Gavin King partly out of frustration with EJB 2's entity beans, and its ideas went on to shape the Java Persistence API standard itself.",
    icon: "/logos/hibernate.svg",
    aspect: 0.959,
    gitLink: "https://github.com/hibernate/hibernate-orm",
  },
  {
    name: "Electron",
    industry: "Desktop app framework",
    founded: 2013,
    description:
      "Electron is a framework for building cross-platform desktop applications using web technologies, combining Chromium and Node.js.",
    funFact:
      "Electron was created at GitHub to build the Atom text editor, combining Chromium and Node.js into a single desktop app runtime.",
    icon: "/logos/electron.svg",
    aspect: 1,
    gitLink: "https://github.com/electron/electron",
  },
  {
    name: "Turborepo",
    industry: "Monorepo build system",
    founded: 2021,
    description:
      "Turborepo is a high-performance build system for JavaScript and TypeScript monorepos, with caching and task orchestration.",
    funFact:
      "Turborepo caches the output of every task so thoroughly that re-running a build with no changes can complete in milliseconds by replaying cached results.",
    icon: "/logos/turborepo.svg",
    aspect: 0.805,
    gitLink: "https://github.com/vercel/turborepo",
  },
  {
    name: "Neo4j",
    industry: "Graph database",
    founded: 2007,
    description: "Neo4j is a native graph database that stores data as nodes and relationships instead of tables.",
    funFact:
      "Neo4j's founders first sketched the idea for a graph database on the back of a napkin during a flight in 2000, but didn't found the company behind it until 2007.",
    icon: "/logos/neo4j.svg",
    aspect: 1,
    gitLink: "https://github.com/neo4j/neo4j",
  },
  {
    name: "Bower",
    industry: "Package manager",
    founded: 2012,
    description:
      "Bower is a package manager for managing front-end web dependencies like JavaScript libraries and CSS frameworks.",
    funFact: "Bower was created at Twitter to manage front-end dependencies before npm and Yarn made it largely obsolete.",
    icon: "/logos/bower.svg",
    aspect: 1.138,
    gitLink: "https://github.com/bower/bower",
  },
  {
    name: "Firebase",
    industry: "App development platform",
    founded: 2011,
    description:
      "Firebase is a Google-owned app development platform offering a realtime database, authentication, hosting, and other backend services.",
    funFact:
      "Firebase began as a real-time chat API startup called Envolve before pivoting entirely to its now-famous realtime database, and was acquired by Google in 2014.",
    icon: "/logos/firebase.svg",
    aspect: 0.795,
    gitLink: "https://github.com/firebase/firebase-js-sdk",
  },
  {
    name: "Drizzle",
    industry: "TypeScript ORM",
    founded: 2022,
    description:
      "Drizzle is a lightweight, type-safe ORM for TypeScript that generates SQL close to what a developer would write by hand.",
    funFact:
      "Drizzle ORM's mascot is a bee, and its logo and branding lean into a honeycomb theme across its documentation and marketing.",
    icon: "/logos/drizzle.svg",
    aspect: 1.18,
    gitLink: "https://github.com/drizzle-team/drizzle-orm",
  },
  {
    name: "Phoenix",
    industry: "Elixir web framework",
    founded: 2014,
    description:
      "Phoenix is a web framework for Elixir, built for high performance, reliability, and real-time features through channels and LiveView.",
    funFact:
      "Phoenix, created by Chris McCord, takes its name from the mythical bird that rises from ashes, a nod to Elixir's fault-tolerant 'let it crash and restart' philosophy it builds on.",
    icon: "/logos/phoenix.svg",
    aspect: 1.463,
    gitLink: "https://github.com/phoenixframework/phoenix",
  },
  {
    name: "Open Source Initiative",
    industry: "Nonprofit standards organization",
    founded: 1998,
    description:
      "The Open Source Initiative is a nonprofit organization that maintains the Open Source Definition and reviews software licenses for compliance with it.",
    funFact:
      "The Open Source Initiative was founded in February 1998 by Bruce Perens and Eric S. Raymond, inspired by Netscape's decision to release the source code of its Communicator browser.",
    icon: "/logos/opensource.svg",
    aspect: 1.032,
    gitLink: "https://github.com/opensourceorg",
  },
  {
    name: "PostCSS",
    industry: "CSS transformation tool",
    founded: 2013,
    description:
      "PostCSS is a tool for transforming CSS with JavaScript plugins, used for tasks like autoprefixing, minification, and nesting.",
    funFact:
      "PostCSS doesn't do anything to CSS by itself; virtually all of its power, including features like Autoprefixer, comes from its plugin ecosystem.",
    icon: "/logos/postcss.svg",
    aspect: 1,
    gitLink: "https://github.com/postcss/postcss",
  },
  {
    name: "Oxc",
    industry: "JavaScript toolchain",
    founded: 2022,
    description:
      "Oxc is a collection of high-performance JavaScript and TypeScript tooling, including a parser, linter, and transformer, written in Rust.",
    funFact:
      "Oxc is short for 'Oxidation Compiler' and rewrites the entire JavaScript toolchain — parser, linter, and transformer — in Rust for order-of-magnitude speedups.",
    icon: "/logos/oxc.svg",
    aspect: 1.631,
    gitLink: "https://github.com/oxc-project/oxc",
  },
  {
    name: "ElysiaJS",
    industry: "Web framework",
    founded: 2022,
    description:
      "ElysiaJS is a web framework built for the Bun runtime, using TypeScript's type system to validate requests at compile time.",
    funFact:
      "ElysiaJS takes its name from Elysium, the paradise of Greek mythology, echoing its goal of making backend development feel effortless.",
    icon: "/logos/elysiajs.svg",
    aspect: 1,
    gitLink: "https://github.com/elysiajs/elysia",
  },
  {
    name: "Flask",
    industry: "Python web framework",
    founded: 2010,
    description: "Flask is a lightweight Python web framework built around simplicity and minimal boilerplate.",
    funFact:
      "Flask started as an April Fools' Day joke by creator Armin Ronacher, a lightweight wrapper around Werkzeug and Jinja2, before it became popular enough to develop seriously.",
    icon: "/logos/flask.svg",
    aspect: 1,
    gitLink: "https://github.com/pallets/flask",
  },
  {
    name: "Pug",
    industry: "Templating engine",
    founded: 2010,
    description: "Pug is a templating engine for Node.js that compiles indentation-based syntax into HTML.",
    funFact:
      "Pug was originally called Jade, but the project had to rename itself in 2016 after discovering 'Jade' was already a registered trademark.",
    icon: "/logos/pug.svg",
    aspect: 1,
    gitLink: "https://github.com/pugjs/pug",
  },
  {
    name: "Lit",
    industry: "Web components library",
    founded: 2019,
    description:
      "Lit is a lightweight library for building fast, reusable Web Components using native browser standards.",
    funFact:
      "Lit is Google's successor to Polymer, built directly on native browser Web Components standards instead of a custom component model.",
    icon: "/logos/lit.svg",
    aspect: 0.8,
    gitLink: "https://github.com/lit/lit",
  },
  {
    name: "Three.js",
    industry: "3D graphics library",
    founded: 2010,
    description:
      "Three.js is a JavaScript library for creating and displaying 3D graphics in the browser using WebGL.",
    funFact:
      "Three.js was created by Ricardo Cabello, known online as Mr.doom, to make WebGL's notoriously low-level API usable without writing raw shader code.",
    icon: "/logos/threejs.svg",
    aspect: 0.988,
    gitLink: "https://github.com/mrdoob/three.js",
  },
  {
    name: "OpenAPI",
    industry: "API specification",
    founded: 2011,
    description:
      "OpenAPI is a specification for describing REST APIs in a machine-readable format, enabling automated documentation and tooling.",
    funFact:
      "OpenAPI began life as the Swagger Specification, created by Tony Tam, before being donated to the Linux Foundation and renamed in 2016.",
    icon: "/logos/openapi.svg",
    aspect: 1,
    gitLink: "https://github.com/OAI/OpenAPI-Specification",
  },
  {
    name: "Mantine",
    industry: "UI component library",
    founded: 2021,
    description:
      "Mantine is a React component library that provides a large set of customizable components and hooks with built-in accessibility.",
    funFact:
      "Mantine was created by Vitaly Rtishchev, largely as a solo project, before growing into one of the most-starred React component libraries on GitHub.",
    icon: "/logos/mantine.svg",
    aspect: 0.992,
    gitLink: "https://github.com/mantinedev/mantine",
  },
  {
    name: "Insomnia",
    industry: "API development platform",
    founded: 2015,
    description:
      "Insomnia is an API development platform for designing, debugging, and testing REST, GraphQL, and gRPC APIs.",
    funFact:
      "Insomnia was built as a solo side project by developer Gregory Schier before Kong Inc. acquired it in 2019 and continued developing it as an open-source alternative to Postman.",
    icon: "/logos/insomnia.svg",
    aspect: 1,
    gitLink: "https://github.com/Kong/insomnia",
  },
  {
    name: "Recoil",
    industry: "State management library",
    founded: 2020,
    description:
      "Recoil is a state management library for React that models application state as a graph of atoms and selectors.",
    funFact:
      "Recoil was built and open-sourced by Facebook to solve state-sharing problems its own engineers kept running into with plain React Context.",
    icon: "/logos/recoil.svg",
    aspect: 0.43,
    gitLink: "https://github.com/facebookexperimental/Recoil",
  },
  {
    name: "Terraform",
    industry: "Infrastructure as code",
    founded: 2014,
    description:
      "Terraform is an infrastructure-as-code tool that lets teams define and provision cloud infrastructure using a declarative configuration language.",
    funFact:
      "Terraform's name nods to 'terraforming', reshaping raw infrastructure into a desired configuration, and it was HashiCorp's second major open-source tool after Vagrant.",
    icon: "/logos/terraform.svg",
    aspect: 0.88,
    gitLink: "https://github.com/hashicorp/terraform",
  },
  {
    name: "Bootstrap",
    industry: "CSS framework",
    founded: 2011,
    description:
      "Bootstrap is a front-end CSS framework for building responsive, mobile-first websites with prebuilt components.",
    funFact: "Bootstrap was created at Twitter by Mark Otto and Jacob Thornton and was originally called Twitter Blueprint.",
    icon: "/logos/bootstrap.svg",
    aspect: 1,
    gitLink: "https://github.com/twbs/bootstrap",
  },
  {
    name: "Windi CSS",
    industry: "Utility-first CSS framework",
    founded: 2020,
    description:
      "Windi CSS is an on-demand utility-first CSS framework that generates styles as needed rather than shipping a full precompiled stylesheet.",
    funFact:
      "Windi CSS generated utility classes on demand instead of shipping a giant precompiled stylesheet, an idea its own maintainers later carried into UnoCSS after sunsetting the project.",
    icon: "/logos/windi-css.svg",
    aspect: 0.918,
    gitLink: "https://github.com/windicss/windicss",
  },
  {
    name: "Yarn",
    industry: "Package manager",
    founded: 2016,
    description:
      "Yarn is a package manager for JavaScript that manages project dependencies with a focus on speed, reliability, and reproducible installs.",
    funFact:
      "Yarn was released by Facebook to fix npm's inconsistent installs at the time, introducing a lockfile that guaranteed the exact same dependency tree on every machine.",
    icon: "/logos/yarn.svg",
    aspect: 1,
    gitLink: "https://github.com/yarnpkg/berry",
  },
  {
    name: "Hono",
    industry: "Web framework",
    founded: 2021,
    description:
      "Hono is a small, fast web framework that runs on any JavaScript runtime, including Cloudflare Workers, Deno, Bun, and Node.js.",
    funFact:
      "Hono's name means 'flame' in Japanese, chosen by creator Yusuke Wada to reflect its focus on being fast and lightweight across any JavaScript runtime.",
    icon: "/logos/hono.svg",
    aspect: 0.776,
    gitLink: "https://github.com/honojs/hono",
  },
  {
    name: "Cucumber",
    industry: "Behavior-driven testing",
    founded: 2008,
    description:
      "Cucumber is a behavior-driven development testing tool that runs automated tests written in plain-language Gherkin syntax.",
    funFact:
      "Cucumber popularized writing tests in plain-English 'Gherkin' syntax so non-programmers could read and help write test specifications.",
    icon: "/logos/cucumber.svg",
    aspect: 0.874,
    gitLink: "https://github.com/cucumber/cucumber",
  },
  {
    name: "Twilio",
    industry: "Communications platform",
    founded: 2008,
    description:
      "Twilio is a cloud communications platform that provides APIs for adding phone calls, SMS, video, and messaging to applications.",
    funFact:
      "Twilio let developers add phone calls and SMS to any application with a simple API call, at a time when telecom infrastructure was normally locked behind carriers.",
    icon: "/logos/twilio.svg",
    aspect: 1,
    gitLink: "https://github.com/twilio",
  },
  {
    name: "React Spring",
    industry: "Animation library",
    founded: 2018,
    description:
      "React Spring is an animation library for React that animates using physics-based spring configurations instead of fixed durations.",
    funFact:
      "react-spring is maintained by the pmndrs collective, the same group of developers behind Zustand and Three.js's React renderer, react-three-fiber.",
    icon: "/logos/react-spring.svg",
    aspect: 1,
    gitLink: "https://github.com/pmndrs/react-spring",
  },
  {
    name: "Polymer",
    industry: "Web components library",
    founded: 2015,
    description: "Polymer is a JavaScript library for building applications using Web Components.",
    funFact:
      "Polymer was Google's early effort to make Web Components practical to use, years before the standard had full native browser support.",
    icon: "/logos/polymer.svg",
    aspect: 1.438,
    gitLink: "https://github.com/Polymer/polymer",
  },
  {
    name: "HTML5",
    industry: "Markup language standard",
    founded: 2008,
    description:
      "HTML5 is the fifth major revision of the HTML standard, adding native support for multimedia, semantic markup, and web application features.",
    funFact:
      "The WHATWG began drafting HTML5 independently in 2004 after browser vendors felt the W3C's XHTML-focused roadmap had stalled, and it wasn't finalized as a full Recommendation until 2014.",
    icon: "/logos/html5.svg",
    aspect: 1,
    gitLink: "https://github.com/whatwg/html",
  },
  {
    name: "Lodash",
    industry: "Utility library",
    founded: 2012,
    description:
      "Lodash is a JavaScript utility library that provides modular helper functions for common tasks like array, object, and string manipulation.",
    funFact:
      "Lodash began as a fork of Underscore.js created by John-David Dalton to fix performance and consistency issues, and it eventually became more widely used than the library it forked from.",
    icon: "/logos/lodash.svg",
    aspect: 1,
    gitLink: "https://github.com/lodash/lodash",
  },
  {
    name: "Analog",
    industry: "Angular meta-framework",
    founded: 2022,
    description:
      "Analog is a full-stack meta-framework for Angular, powered by Vite and Nitro, bringing conventions similar to Next.js and Nuxt.",
    funFact:
      "Analog was created by Angular Google Developer Expert Brandon Roberts to bring the fullstack meta-framework pattern of Next.js and Nuxt to Angular, powered by Vite and Nitro.",
    icon: "/logos/analog.svg",
    aspect: 1.407,
    gitLink: "https://github.com/analogjs/analog",
  },
  {
    name: "VueUse",
    industry: "Utility library",
    founded: 2019,
    description:
      "VueUse is a collection of essential composition utilities for Vue, covering everything from browser APIs to sensors and animation.",
    funFact:
      "VueUse is maintained largely by Anthony Fu, one of the most prolific open-source authors in the Vue and Vite ecosystems.",
    icon: "/logos/vueuse.svg",
    aspect: 0.924,
    gitLink: "https://github.com/vueuse/vueuse",
  },
  {
    name: "Gulp",
    industry: "Task runner",
    founded: 2013,
    description:
      "Gulp is a JavaScript task runner that automates build processes like compiling, minifying, and testing using code-based pipelines.",
    funFact:
      "Gulp processes files through in-memory streams rather than writing temporary files to disk, which made it noticeably faster than Grunt at the time.",
    icon: "/logos/gulp.svg",
    aspect: 0.452,
    gitLink: "https://github.com/gulpjs/gulp",
  },
  {
    name: "New Relic",
    industry: "Observability platform",
    founded: 2008,
    description:
      "New Relic is an observability platform that provides application performance monitoring, infrastructure monitoring, and analytics.",
    funFact:
      "New Relic was founded by Lew Cirne, who had previously built and sold an earlier application performance monitoring company called Wily Technology.",
    icon: "/logos/new-relic.svg",
    aspect: 0.865,
    gitLink: "https://github.com/newrelic",
  },
  {
    name: "Axios",
    industry: "HTTP client library",
    founded: 2014,
    description:
      "Axios is a promise-based HTTP client for JavaScript, used in both browsers and Node.js to make API requests.",
    funFact:
      "Axios was created by Matt Zabriskie and automatically transforms JSON data while working identically in both browsers and Node.js from a single API.",
    icon: "/logos/axios.svg",
    aspect: 1,
    gitLink: "https://github.com/axios/axios",
  },
  {
    name: "Rsbuild",
    industry: "Build tool",
    founded: 2024,
    description:
      "Rsbuild is a build tool built on top of the Rspack bundler, providing sensible defaults for web application development.",
    funFact:
      "Rsbuild is built by ByteDance on top of their Rspack bundler, packaging it with sensible defaults so teams don't have to configure it from scratch.",
    icon: "/logos/rsbuild.svg",
    aspect: 1.066,
    gitLink: "https://github.com/web-infra-dev/rsbuild",
  },
  {
    name: "GitHub Actions",
    industry: "CI/CD platform",
    founded: 2018,
    description:
      "GitHub Actions is a CI/CD platform built into GitHub that automates build, test, and deployment workflows triggered by repository events.",
    funFact:
      "GitHub Actions launched with the ability to package build steps as portable, shareable actions, turning CI configuration itself into an open-source ecosystem.",
    icon: "/logos/github-actions.svg",
    aspect: 1,
    gitLink: "https://github.com/actions",
  },
  {
    name: "Preact",
    industry: "JavaScript library",
    founded: 2015,
    description:
      "Preact is a fast, lightweight alternative to React with the same modern API in a much smaller package.",
    funFact: "Preact reimplements the React API in about 3KB of JavaScript, roughly a tenth the size of React itself.",
    icon: "/logos/preact.svg",
    aspect: 0.865,
    gitLink: "https://github.com/preactjs/preact",
  },
  {
    name: "Stately",
    industry: "State machine visualizer",
    founded: 2021,
    description:
      "Stately is a visual editor and platform for designing and inspecting state machines and statecharts.",
    funFact:
      "Stately was founded by David Khourshid, creator of the XState library, to give state machines a visual editor instead of only code.",
    icon: "/logos/stately.svg",
    aspect: 0.837,
    gitLink: "https://github.com/statelyai",
  },
  {
    name: "Docusaurus",
    industry: "Documentation framework",
    founded: 2017,
    description:
      "Docusaurus is a static site generator built for creating documentation websites, with versioning and Markdown support.",
    funFact: "Docusaurus was built at Meta to power its own open-source documentation sites before being released for everyone to use.",
    icon: "/logos/docusaurus.svg",
    aspect: 1.174,
    gitLink: "https://github.com/facebook/docusaurus",
  },
  {
    name: "Appwrite",
    industry: "Backend-as-a-service",
    founded: 2019,
    description:
      "Appwrite is an open-source backend-as-a-service platform providing authentication, databases, storage, and functions for web and mobile apps.",
    funFact:
      "Appwrite was open-sourced by Eldad Fux in 2019 as a self-hosted alternative to Firebase, packaged entirely as Docker microservices.",
    icon: "/logos/appwrite.svg",
    aspect: 1,
    gitLink: "https://github.com/appwrite/appwrite",
  },
  {
    name: "GreenSock",
    industry: "Animation library",
    founded: 2008,
    description:
      "GreenSock (GSAP) is a JavaScript animation library used to create high-performance, cross-browser animations for web pages.",
    funFact:
      "GreenSock's GSAP animation engine is used so heavily in advertising and awwwards-winning sites that it's often called the industry standard for web animation.",
    icon: "/logos/greensock.svg",
    aspect: 0.862,
    gitLink: "https://github.com/greensock/GSAP",
  },
  {
    name: "Remotion",
    industry: "Video creation library",
    founded: 2021,
    description:
      "Remotion is a library for programmatically creating videos using React components, rendering each frame as code.",
    funFact:
      "Remotion was created by developer Jonny Burger, who originally built it to generate personalized birthday videos before turning it into a general-purpose video framework.",
    icon: "/logos/remotion.svg",
    aspect: 1,
    gitLink: "https://github.com/remotion-dev/remotion",
  },
  {
    name: "Biome",
    industry: "Linter and formatter",
    founded: 2023,
    description:
      "Biome is a fast formatter and linter for JavaScript, TypeScript, JSX, and JSON, built as a single tool in Rust.",
    funFact:
      "Biome began as a community fork of the abandoned Rome toolchain, rebuilt by former Rome maintainers in a single Rust codebase.",
    icon: "/logos/biomejs.svg",
    aspect: 1.153,
    gitLink: "https://github.com/biomejs/biome",
  },
  {
    name: "nuqs",
    industry: "URL state library",
    founded: 2020,
    description:
      "nuqs is a library that keeps React state synchronized with the URL query string in a type-safe way.",
    funFact:
      "nuqs (pronounced 'nukes') keeps React state type-safe and synced directly to the URL query string, so state survives refreshes and is shareable by link.",
    icon: "/logos/nuqs.svg",
    aspect: 1,
    gitLink: "https://github.com/47ng/nuqs",
  },
  {
    name: "styled-components",
    industry: "CSS-in-JS library",
    founded: 2016,
    description:
      "styled-components is a CSS-in-JS library that lets developers write actual CSS scoped to individual React components.",
    funFact:
      "styled-components was first announced on stage at ParisReact in 2016 by creators Max Stoiber and Glen Maddern as a way to write real CSS scoped to a component without class-name collisions.",
    icon: "/logos/styledcomponents.svg",
    aspect: 1,
    gitLink: "https://github.com/styled-components/styled-components",
  },
  {
    name: "Ant Design",
    industry: "UI component library",
    founded: 2015,
    description:
      "Ant Design is a design system and React UI library providing a comprehensive set of high-quality components.",
    funFact:
      "Ant Design was built by Alibaba's UED team and takes its name from the idea of many small, disciplined components working together like a colony of ants.",
    icon: "/logos/antdesign.svg",
    aspect: 1,
    gitLink: "https://github.com/ant-design/ant-design",
  },
  {
    name: "Zustand",
    industry: "State management library",
    founded: 2019,
    description:
      "Zustand is a small, fast state management library for React that uses simplified, hook-based store patterns.",
    funFact:
      "Zustand, German for 'state', was built by the pmndrs collective, the same group behind react-spring, and needs no context provider wrapping the app.",
    icon: "/logos/zustand.svg",
    aspect: 1,
    gitLink: "https://github.com/pmndrs/zustand",
  },
  {
    name: "Jasmine",
    industry: "Testing framework",
    founded: 2010,
    description:
      "Jasmine is a behavior-driven testing framework for JavaScript that requires no DOM or dependencies to run.",
    funFact:
      "Jasmine was designed to need no DOM and no other JavaScript frameworks at all, making it runnable in virtually any environment.",
    icon: "/logos/jasmine.svg",
    aspect: 1.004,
    gitLink: "https://github.com/jasmine/jasmine",
  },
  {
    name: "Ruby",
    industry: "Programming language",
    founded: 1995,
    description: "Ruby is a dynamic, object-oriented programming language known for its clean, expressive syntax.",
    funFact: "Ruby was designed to make programmers happy, a stated goal of creator Yukihiro Matsumoto from day one.",
    icon: "/logos/ruby.svg",
    aspect: 1.004,
    gitLink: "https://github.com/ruby/ruby",
  },
  {
    name: "Autoprefixer",
    industry: "PostCSS plugin",
    founded: 2013,
    description:
      "Autoprefixer is a PostCSS plugin that parses CSS and automatically adds vendor prefixes using values from the Can I Use database.",
    funFact:
      "Autoprefixer's first prototype was built on top of the Rework CSS toolkit and was originally named 'rework-vendors' before creator Andrey Sitnik spun it into its own project.",
    icon: "/logos/autoprefixer.svg",
    aspect: 1.326,
    gitLink: "https://github.com/postcss/autoprefixer",
  },
  {
    name: "AVA",
    industry: "Testing framework",
    founded: 2014,
    description:
      "AVA is a Node.js test runner that runs tests concurrently in separate processes, with a concise API and detailed error output.",
    funFact:
      "AVA's name isn't an acronym — its creators simply liked that it's the Andromeda galaxy, pronounced /ˈeɪvə/.",
    icon: "/logos/ava.svg",
    aspect: 1.829,
    gitLink: "https://github.com/avajs/ava",
  },
  {
    name: "Base UI",
    industry: "UI component library",
    founded: 2024,
    description:
      "Base UI is an unstyled React component library that provides accessible, headless building blocks for design systems without prescribing any styling solution.",
    funFact:
      "Base UI is a joint project from the original creators of Radix, Floating UI, and Material UI, several of whom left Radix's earlier home to build it under MUI's full-time backing.",
    icon: "/logos/base-ui.svg",
    aspect: 0.708,
    gitLink: "https://github.com/mui/base-ui",
  },
  {
    name: "Blitz.js",
    industry: "Fullstack web framework",
    founded: 2020,
    description:
      "Blitz.js is a fullstack React framework built on top of Next.js, inspired by Ruby on Rails, that adds a 'Zero-API' data layer so client code can call server code directly.",
    funFact:
      "Creator Brandon Bayer publicly announced Blitz in February 2020 with only a couple hundred lines of prototype code, before it later pivoted from a standalone framework into a toolkit.",
    icon: "/logos/blitzjs.svg",
    aspect: 0.65,
    gitLink: "https://github.com/blitz-js/blitz",
  },
  {
    name: "Brain.js",
    industry: "Machine learning library",
    founded: 2016,
    description:
      "Brain.js is a JavaScript library for building and training neural networks, with optional GPU acceleration in the browser and Node.js.",
    funFact:
      "Brain.js began as Robert Plummer's 2016 fork of Heather Arthur's earlier 'brain' library, which she had stopped maintaining around 2014.",
    icon: "/logos/brainjs.svg",
    aspect: 1,
    gitLink: "https://github.com/BrainJS/brain.js",
  },
  {
    name: "CodeIgniter",
    industry: "PHP framework",
    founded: 2006,
    description:
      "CodeIgniter is a lightweight PHP web framework designed for building applications quickly with minimal configuration.",
    funFact:
      "CodeIgniter was created by Rick Ellis at EllisLab as an offshoot of classes from their ExpressionEngine CMS, and stewardship later passed to the British Columbia Institute of Technology (BCIT) in 2014.",
    icon: "/logos/codeigniter.svg",
    aspect: 0.81,
    gitLink: "https://github.com/codeigniter4/CodeIgniter4",
  },
  {
    name: "CodeRabbit",
    industry: "AI code review platform",
    founded: 2023,
    description:
      "CodeRabbit is an AI-powered code review platform that automatically analyzes pull requests and provides contextual feedback, summaries, and suggested fixes.",
    funFact:
      "CodeRabbit was founded by Harjot Gill in 2023 and reached a $1.5 billion valuation within about two years of launching.",
    icon: "/logos/coderabbit.svg",
    aspect: 1,
    gitLink: "https://github.com/coderabbitai",
  },
  {
    name: "Convex",
    industry: "Backend platform",
    founded: 2021,
    description:
      "Convex is a backend platform that combines a reactive, transactional database with serverless TypeScript functions that sync results to clients in real time.",
    funFact:
      "Convex's founders — Jamie Turner, James Cowling, and Sujay Jayakar — previously built Dropbox's exabyte-scale 'Magic Pocket' storage system before starting the company.",
    icon: "/logos/convex.svg",
    aspect: 0.97,
    gitLink: "https://github.com/get-convex/convex-backend",
  },
  {
    name: "Apache Cordova",
    industry: "Mobile app framework",
    founded: 2008,
    description:
      "Apache Cordova is a framework for building mobile apps using HTML, CSS, and JavaScript, wrapped in a native container with access to device APIs.",
    funFact:
      "Cordova began as PhoneGap, built by Nitobi Software at an iPhoneDevCamp hackathon in 2008; after Adobe acquired Nitobi in 2011, the code was donated to Apache and renamed after Cordova Street, where Nitobi's Vancouver office was located.",
    icon: "/logos/cordova.svg",
    aspect: 1.045,
    gitLink: "https://github.com/apache/cordova",
  },
  {
    name: "Crossplane",
    industry: "Cloud infrastructure platform",
    founded: 2018,
    description:
      "Crossplane is a CNCF framework that extends the Kubernetes API to provision and manage cloud infrastructure as custom resources.",
    funFact:
      "Crossplane was created by Upbound and publicly announced at KubeCon Seattle in December 2018, reusing Kubernetes' own control-plane machinery to manage infrastructure outside the cluster.",
    icon: "/logos/crossplane.svg",
    aspect: 0.474,
    gitLink: "https://github.com/crossplane/crossplane",
  },
  {
    name: "Deno",
    industry: "JavaScript runtime",
    founded: 2018,
    description:
      "Deno is a secure-by-default runtime for JavaScript and TypeScript that runs outside the browser with built-in TypeScript support and no npm-style node_modules folder.",
    funFact:
      "Deno was created by Ryan Dahl, the original creator of Node.js, and its name is an anagram of 'Node' — he unveiled it in a 2018 talk titled '10 Things I Regret About Node.js.'",
    icon: "/logos/deno.svg",
    aspect: 1,
    gitLink: "https://github.com/denoland/deno",
  },
  {
    name: "Directus",
    industry: "Headless CMS platform",
    founded: 2012,
    description:
      "Directus is an open-source data platform that wraps any SQL database with instant REST and GraphQL APIs and a customizable admin app, functioning as a headless CMS.",
    funFact:
      "Founder Ben Haynes first built Directus as an internal tool at his own digital agency, and it wasn't until years later, in 2015, that he and co-founder Rijk van Zanten turned it into a dedicated full-time startup.",
    icon: "/logos/directus.svg",
    aspect: 0.996,
    gitLink: "https://github.com/directus/directus",
  },
  {
    name: "Django",
    industry: "Python web framework",
    founded: 2005,
    description:
      "Django is a high-level Python web framework that emphasizes rapid development and a 'batteries included' philosophy, with a built-in ORM and admin interface.",
    funFact:
      "Django is named after jazz guitarist Django Reinhardt, a favorite of co-creator Adrian Holovaty, and was released publicly under a BSD license in July 2005.",
    icon: "/logos/django.svg",
    aspect: 1,
    gitLink: "https://github.com/django/django",
  },
  {
    name: "Docus",
    industry: "Documentation framework",
    founded: 2020,
    description:
      "Docus is a documentation theme and toolkit built on Nuxt that turns Markdown content into a styled, searchable documentation site with minimal setup.",
    funFact:
      "Docus was rewritten from the ground up for its v3 release and now lives under the Nuxt Content team's GitHub org rather than its original NuxtLabs home.",
    icon: "/logos/docus.svg",
    aspect: 1.031,
    gitLink: "https://github.com/nuxt-content/docus",
  },
  {
    name: "Dokploy",
    industry: "Deployment platform",
    founded: 2024,
    description:
      "Dokploy is a free, self-hostable platform-as-a-service that lets developers deploy applications, databases, and static sites on their own servers, positioned as an open-source alternative to Vercel, Netlify, and Heroku.",
    funFact:
      "Dokploy was built and is primarily maintained by a single developer, Mauricio Siu, who launched it in June 2024.",
    icon: "/logos/dokploy.svg",
    aspect: 1.185,
    gitLink: "https://github.com/dokploy/dokploy",
  },
  {
    name: "EditorConfig",
    industry: "Coding style standard",
    founded: 2011,
    description:
      "EditorConfig is a file format and collection of editor plugins that maintain consistent coding styles, such as indentation and line endings, across different editors and IDEs.",
    funFact:
      "EditorConfig's .editorconfig file format was directly inspired by the layout of Git's own .gitconfig and .gitignore files.",
    icon: "/logos/editorconfig.svg",
    aspect: 1.032,
    gitLink: "https://github.com/editorconfig/editorconfig",
  },
  {
    name: "Elasticsearch",
    industry: "Search and analytics engine",
    founded: 2010,
    description:
      "Elasticsearch is a distributed, RESTful search and analytics engine built on Apache Lucene that stores and indexes data for fast full-text search and analytics.",
    funFact:
      "Elasticsearch creator Shay Banon originally built an earlier prototype called Compass in 2004 to help his wife search recipes while she studied at Le Cordon Bleu.",
    icon: "/logos/elasticsearch.svg",
    aspect: 0.889,
    gitLink: "https://github.com/elastic/elasticsearch",
  },
  {
    name: "Eleventy",
    industry: "Static site generator",
    founded: 2017,
    description:
      "Eleventy (11ty) is a simpler static site generator for JavaScript that supports multiple templating languages without imposing a client-side framework.",
    funFact:
      "Eleventy was created by Zach Leatherman as an alternative to Jekyll, and Netlify hired him to work on it full-time before the project moved under Font Awesome in 2024.",
    icon: "/logos/eleventy.svg",
    aspect: 1.196,
    gitLink: "https://github.com/11ty/eleventy",
  },
  {
    name: "Exome",
    industry: "State management library",
    founded: 2021,
    description:
      "Exome is a lightweight, framework-agnostic JavaScript state management library where classes extending a base Exome object hold state and their methods act as actions.",
    funFact:
      "Exome was created by developer Mārcis Bergmanis and supports nearly every major frontend framework — React, Vue, Svelte, Solid, Angular, Lit — plus vanilla JS from a single core.",
    icon: "/logos/exome.svg",
    aspect: 1,
    gitLink: "https://github.com/Marcisbee/exome",
  },
  {
    name: "Flowbite",
    industry: "UI component library",
    founded: 2021,
    description:
      "Flowbite is an open-source library of interactive UI components built on top of Tailwind CSS, along with a matching Figma design system.",
    funFact:
      "Flowbite was built by Zoltán Szőgyényi, who had previously created the popular free Tailwind CSS admin dashboard template 'Windmill Dashboard.'",
    icon: "/logos/flowbite.svg",
    aspect: 1,
    gitLink: "https://github.com/themesberg/flowbite",
  },
  {
    name: "Foundation",
    industry: "CSS framework",
    founded: 2011,
    description:
      "Foundation is a responsive front-end framework from ZURB providing a grid system, UI components, and templates for building websites and emails.",
    funFact:
      "Foundation grew out of ZURB's internal style guide, used across the design agency's own client projects since 2008, before being open-sourced as a standalone framework in 2011.",
    icon: "/logos/foundation.svg",
    aspect: 0.674,
    gitLink: "https://github.com/foundation/foundation-sites",
  },
  {
    name: "Framer",
    industry: "No-code website builder",
    founded: 2014,
    description:
      "Framer is a design and website-building tool that lets users design, prototype, and publish production websites from a single visual canvas.",
    funFact:
      "Framer began as a free JavaScript prototyping library before its makers pivoted the company toward a paid, no-code website builder in 2018 after growth stalled.",
    icon: "/logos/framer.svg",
    aspect: 0.667,
    gitLink: "https://github.com/framer",
  },
  {
    name: "Gin",
    industry: "Web framework",
    founded: 2014,
    description:
      "Gin is a high-performance HTTP web framework for Go, built on a radix-tree router that provides fast routing and middleware support for building APIs.",
    funFact:
      "Gin began life as the internal web framework for Fyve, a now-defunct social network startup, before its creators spun it out as a standalone open-source project.",
    icon: "/logos/gin.svg",
    aspect: 0.711,
    gitLink: "https://github.com/gin-gonic/gin",
  },
  {
    name: "JSON-LD",
    industry: "Data interchange format",
    founded: 2010,
    description:
      "JSON-LD is a W3C standard for encoding Linked Data using JSON, allowing structured data to be embedded in web pages and understood by search engines and other consumers.",
    funFact:
      "JSON-LD reached official W3C Recommendation status on January 16, 2014, after being championed since around 2010 by Manu Sporny and Dave Longley of Digital Bazaar.",
    icon: "/logos/json-ld.svg",
    aspect: 1.369,
    gitLink: "https://github.com/json-ld/json-ld.org",
  },
  {
    name: "JSON Schema",
    industry: "Data validation standard",
    founded: 2007,
    description:
      "JSON Schema is a vocabulary that lets you annotate and validate JSON documents, describing their expected structure, types, and constraints.",
    funFact:
      "JSON Schema traces back to a proposal Kris Zyp submitted to json.com on October 2, 2007 — years before it became a stable, widely adopted IETF/community specification.",
    icon: "/logos/json-schema.svg",
    aspect: 1.164,
    gitLink: "https://github.com/json-schema-org/json-schema-spec",
  },
  {
    name: "Kibo UI",
    industry: "Component registry",
    founded: 2024,
    description:
      "Kibo UI is a custom shadcn/ui component registry offering more complex, composable components — like Gantt charts, Kanban boards, and code editors — built on the same primitives and CSS variables as shadcn/ui.",
    funFact:
      "Kibo UI was created by developer Hayden Bleasel and was acquired by Shadcnblocks in late 2025, which now maintains the canonical repository.",
    icon: "/logos/kibo-ui.svg",
    aspect: 1.009,
    gitLink: "https://github.com/shadcnblocks/kibo",
  },
  {
    name: "Lemon Squeezy",
    industry: "Merchant of record platform",
    founded: 2021,
    description:
      "Lemon Squeezy is a merchant-of-record platform that handles payments, subscriptions, licensing, and global sales-tax compliance for software companies.",
    funFact:
      "Lemon Squeezy passed $1 million in annual recurring revenue just nine months after its 2021 public launch, and was acquired by Stripe in 2024 for an undisclosed sum.",
    icon: "/logos/lemonsqueezy.svg",
    aspect: 0.75,
    gitLink: "https://github.com/lmsqueezy",
  },
  {
    name: "Logstash",
    industry: "Log processing pipeline",
    founded: 2009,
    description:
      "Logstash is an open-source data processing pipeline that ingests, transforms, and ships logs and events from multiple sources into destinations like Elasticsearch.",
    funFact:
      "Logstash was created independently by sysadmin Jordan Sissel to wrangle his own sprawling log files, and only later did he discover Elasticsearch was the ideal place to store the data — Elastic hired him in 2013.",
    icon: "/logos/logstash.svg",
    aspect: 0.834,
    gitLink: "https://github.com/elastic/logstash",
  },
  {
    name: "Mailchimp",
    industry: "Email marketing platform",
    founded: 2001,
    description:
      "Mailchimp is an email marketing and marketing automation platform that helps businesses design campaigns, manage audiences, and track performance.",
    funFact:
      "Mailchimp started as a side project alongside founders Ben Chestnut and Dan Kurzius's web design agency, and the pair bootstrapped it profitably for two decades before Intuit acquired it for $12 billion in 2021.",
    icon: "/logos/mailchimp.svg",
    aspect: 0.88,
    gitLink: "https://github.com/mailchimp",
  },
  {
    name: "Malina.js",
    industry: "Frontend compiler framework",
    founded: 2020,
    description:
      "Malina.js is a compiler-based JavaScript framework, inspired by Svelte, that compiles components into small, dependency-free vanilla JavaScript at build time.",
    funFact:
      "'Malina' is the Russian and Slavic word for 'raspberry,' giving the framework a fruit-themed name unrelated to its technical purpose.",
    icon: "/logos/malinajs.svg",
    aspect: 0.78,
    gitLink: "https://github.com/malinajs/malinajs",
  },
  {
    name: "Matomo",
    industry: "Web analytics platform",
    founded: 2007,
    description:
      "Matomo is an open-source web analytics platform that lets organizations track and analyze visitor and app behavior while keeping full ownership of the data, typically self-hosted.",
    funFact:
      "Matomo was originally released in 2007 as Piwik, created by Matthieu Aubry, and was renamed to Matomo — Japanese for 'decent' — in January 2018 so the project could secure an exclusive brand name.",
    icon: "/logos/matomo.svg",
    aspect: 1.766,
    gitLink: "https://github.com/matomo-org/matomo",
  },
  {
    name: "Mermaid",
    industry: "Diagramming and charting tool",
    founded: 2014,
    description:
      "Mermaid is a JavaScript-based tool that renders diagrams and flowcharts from a simple, Markdown-inspired text syntax.",
    funFact:
      "Creator Knut Sveidqvist named the project after The Little Mermaid, which his children were watching around the time he built the first version in 2014.",
    icon: "/logos/mermaid.svg",
    aspect: 1,
    gitLink: "https://github.com/mermaid-js/mermaid",
  },
  {
    name: "Million",
    industry: "React optimization library",
    founded: 2021,
    description:
      "Million is an optimizing compiler that speeds up React rendering by replacing parts of React's virtual DOM diffing with a faster algorithm.",
    funFact: "Million was created by Aiden Bai as a personal research project when he was just 16 years old.",
    icon: "/logos/million.svg",
    aspect: 1.407,
    gitLink: "https://github.com/aidenybai/million",
  },
  {
    name: "Motion",
    industry: "Animation library",
    founded: 2018,
    description:
      "Motion is an animation library for JavaScript, React, and Vue that pairs a simple declarative API with a hybrid hardware-accelerated engine.",
    funFact:
      "Motion was known as Framer Motion for years before its creator, Matt Perry, spun it out into an independent, framework-agnostic project in November 2024 — a separate project from the Framer design tool it was named after.",
    icon: "/logos/motion.svg",
    aspect: 2.858,
    gitLink: "https://github.com/motiondivision/motion",
  },
  {
    name: "n8n",
    industry: "Workflow automation platform",
    founded: 2019,
    description:
      "n8n is a fair-code workflow automation platform that lets users visually connect apps and APIs, combining a node-based builder with the option to write custom code.",
    funFact:
      "The name 'n8n' is a numeronym for 'nodemation' (n + the 8 letters 'odemation' + n), coined by founder Jan Oberhauser because he didn't want to type the full word repeatedly in the terminal.",
    icon: "/logos/n8n.svg",
    aspect: 1.9,
    gitLink: "https://github.com/n8n-io/n8n",
  },
  {
    name: "Neon",
    industry: "Serverless database platform",
    founded: 2021,
    description:
      "Neon is a serverless Postgres platform that separates storage from compute so databases can autoscale, branch like Git repositories, and scale to zero when idle.",
    funFact:
      "Neon was acquired by Databricks for roughly $1 billion in 2025; co-founder and CEO Nikita Shamgunov had previously run the database startup SingleStore before starting Neon.",
    icon: "/logos/neon.svg",
    aspect: 1,
    gitLink: "https://github.com/neondatabase/neon",
  },
  {
    name: "Nx",
    industry: "Monorepo build system",
    founded: 2017,
    description:
      "Nx is a build system with built-in tooling and caching designed to help manage and scale monorepos across multiple languages and frameworks.",
    funFact:
      "Nx was created by Jeff Cross and Victor Savkin, two engineers who left Google's Angular team in 2016 to found Nrwl, initially building Nx as an extension of the Angular CLI.",
    icon: "/logos/nx.svg",
    aspect: 1,
    gitLink: "https://github.com/nrwl/nx",
  },
  {
    name: "opencode",
    industry: "AI coding agent",
    founded: 2025,
    description:
      "opencode is an open-source, terminal-based AI coding agent that lets developers use any supported language model to read, edit, and run code directly in their own project.",
    funFact:
      "opencode's name came out of a dispute: developer Kujtim Hoxha's original 'TermAI' project was rebranded to OpenCode, after which Charm, maker of the terminal toolkit it was built on, renamed its own fork to 'Crush,' while the team behind this project kept the OpenCode name and later rebranded to Anomaly.",
    icon: "/logos/opencode.svg",
    aspect: 1,
    gitLink: "https://github.com/anomalyco/opencode",
  },
  {
    name: "Payload",
    industry: "Headless CMS framework",
    founded: 2021,
    description:
      "Payload is an open-source, TypeScript-based headless CMS and application framework built on Next.js that gives developers a full backend and admin panel out of the box.",
    funFact:
      "Payload was acquired by Figma in 2025, about four years after founder James Mikrut launched its first public beta in January 2021.",
    icon: "/logos/payload.svg",
    aspect: 1,
    gitLink: "https://github.com/payloadcms/payload",
  },
  {
    name: "PocketBase",
    industry: "Backend-as-a-service platform",
    founded: 2022,
    description:
      "PocketBase is an open-source backend that packages an embedded SQLite database, realtime subscriptions, authentication, file storage, and an admin dashboard into a single portable Go executable.",
    funFact:
      "PocketBase is built and maintained largely by a single Bulgarian developer, Gani Georgiev, who deliberately offers no official paid hosted cloud version, positioning it as a self-hosted alternative to Firebase and Supabase.",
    icon: "/logos/pocket-base.svg",
    aspect: 1,
    gitLink: "https://github.com/pocketbase/pocketbase",
  },
  {
    name: "Radix UI",
    industry: "UI component library",
    founded: 2020,
    description:
      "Radix UI (Radix Primitives) is an open-source library of low-level, unstyled, accessible component primitives for building custom design systems in React.",
    funFact:
      "Radix UI was originally built by design startup Modulz, which was acquired by WorkOS in 2022; several of its original creators later went on to build Base UI, a separate headless component library released with MUI in 2024.",
    icon: "/logos/radix-ui.svg",
    aspect: 0.68,
    gitLink: "https://github.com/radix-ui/primitives",
  },
  {
    name: "Rancher",
    industry: "Kubernetes management platform",
    founded: 2014,
    description:
      "Rancher is a complete platform for deploying and managing multiple Kubernetes clusters across any infrastructure, on-premises or in the cloud.",
    funFact:
      "Rancher Labs was founded by Sheng Liang, Shannon Williams, Darren Shepherd, and Will Chan — veterans of the earlier cloud startup Cloud.com — and was acquired by SUSE in 2020 for over $600 million.",
    icon: "/logos/rancher.svg",
    aspect: 2.116,
    gitLink: "https://github.com/rancher/rancher",
  },
  {
    name: "Redux-Saga",
    industry: "State management middleware",
    founded: 2015,
    description:
      "Redux-Saga is a middleware library that manages complex asynchronous side effects and data flows in Redux applications using JavaScript generator functions.",
    funFact:
      "Redux-Saga takes its name from the decades-old 'saga pattern' for coordinating distributed transactions, first described in a 1987 database-systems paper, repurposed here through ES6 generator functions.",
    icon: "/logos/redux-saga.svg",
    aspect: 1.631,
    gitLink: "https://github.com/redux-saga/redux-saga",
  },
  {
    name: "Resend",
    industry: "Email API platform",
    founded: 2023,
    description:
      "Resend is a transactional email API platform that lets developers send, manage, and track emails through a modern REST API and SDKs.",
    funFact:
      "Resend was built by Zeno Rocha and Bu Kinoshita, the team behind the open-source React Email project, before they turned it into a full sending platform through Y Combinator's Winter 2023 batch.",
    icon: "/logos/resend.svg",
    aspect: 1,
    gitLink: "https://github.com/resend",
  },
  {
    name: "Rspack",
    industry: "JavaScript bundler",
    founded: 2023,
    description:
      "Rspack is a Rust-based JavaScript bundler that provides a Webpack-compatible API and configuration for drop-in migration.",
    funFact:
      "Rspack was built by ByteDance's web infrastructure team after some of the company's Webpack builds had grown to take ten minutes to half an hour, and early internal migrations saw 5-10x build speedups.",
    icon: "/logos/rspack.svg",
    aspect: 1.287,
    gitLink: "https://github.com/web-infra-dev/rspack",
  },
  {
    name: "Scala",
    industry: "Programming language",
    founded: 2004,
    description:
      "Scala is a statically typed programming language that fuses object-oriented and functional programming and runs on the JVM.",
    funFact:
      "Scala's name is a portmanteau of 'scalable language,' reflecting Martin Odersky's goal of a language that works equally well for small scripts and large systems.",
    icon: "/logos/scala.svg",
    aspect: 0.615,
    gitLink: "https://github.com/scala/scala",
  },
  {
    name: "Shiki",
    industry: "Syntax highlighter",
    founded: 2018,
    description:
      "Shiki is a syntax highlighter that renders code into accurate, pre-highlighted HTML using the same TextMate grammars and themes that power VS Code.",
    funFact:
      "Shiki was built in 2018 by Pine Wu, then an engineer on the VS Code team, as an experiment in bringing VS Code's own Oniguruma-based grammar engine to statically render code outside the editor.",
    icon: "/logos/shiki.svg",
    aspect: 1,
    gitLink: "https://github.com/shikijs/shiki",
  },
  {
    name: "Sinatra",
    industry: "Ruby web framework",
    founded: 2007,
    description:
      "Sinatra is a lightweight Ruby DSL for quickly building web applications without the full structure of a framework like Rails.",
    funFact:
      "Sinatra's own AUTHORS file jokingly credits Frank Sinatra himself as 'chairman of the board' for having so much class the framework deserved his name.",
    icon: "/logos/sinatra.svg",
    aspect: 1.471,
    gitLink: "https://github.com/sinatra/sinatra",
  },
  {
    name: "Snyk",
    industry: "Developer security platform",
    founded: 2015,
    description:
      "Snyk is a developer security platform that finds and fixes vulnerabilities in open-source dependencies, containers, and infrastructure as code.",
    funFact:
      "Snyk's name was chosen after founder Guy Podjarny searched the spelling and found on Urban Dictionary that it doubled as an acronym for 'so now you know.'",
    icon: "/logos/snyk.svg",
    aspect: 0.611,
    gitLink: "https://github.com/snyk",
  },
  {
    name: "Strapi",
    industry: "Headless CMS",
    founded: 2015,
    description:
      "Strapi is an open-source, JavaScript-based headless CMS that lets developers build customizable APIs for managing and delivering content.",
    funFact:
      "Strapi's name comes from 'bootstrap your API,' reflecting its origins as a mix of an API framework and CMS built by three freelance developers frustrated with traditional CMS tools.",
    icon: "/logos/strapi.svg",
    aspect: 1,
    gitLink: "https://github.com/strapi/strapi",
  },
  {
    name: "Stripe",
    industry: "Payments platform",
    founded: 2010,
    description:
      "Stripe is a payments platform that provides APIs for businesses to accept payments, manage billing, and handle financial infrastructure online.",
    funFact:
      "Stripe was originally built under the working name '/dev/payments' by brothers Patrick and John Collison, who reportedly kept riding their bikes to the office even after becoming millionaires.",
    icon: "/logos/stripe.svg",
    aspect: 1,
    gitLink: "https://github.com/stripe",
  },
  {
    name: "Stylelint",
    industry: "CSS linter",
    founded: 2015,
    description:
      "Stylelint is a CSS linter, built on PostCSS, that catches errors and enforces consistent conventions across CSS, SCSS, Less, and other stylesheet dialects.",
    funFact:
      "Stylelint was created in 2015 by David Clark and Maxime Thirouin, who modeled its plugin system on ESLint's after finding the existing scss-lint tool too limited.",
    icon: "/logos/stylelint.svg",
    aspect: 1.045,
    gitLink: "https://github.com/stylelint/stylelint",
  },
  {
    name: "SurrealDB",
    industry: "Multi-model database",
    founded: 2021,
    description:
      "SurrealDB is a multi-model database that combines document, graph, relational, and key-value data with real-time queries in a single engine.",
    funFact:
      "SurrealDB's first working version in 2017 was written entirely in Go, years before the team rewrote it from scratch in Rust for its 2021 public release.",
    icon: "/logos/surrealdb.svg",
    aspect: 0.856,
    gitLink: "https://github.com/surrealdb/surrealdb",
  },
  {
    name: "Tauri",
    industry: "Desktop app framework",
    founded: 2019,
    description:
      "Tauri is a framework for building small, secure desktop and mobile applications using a web frontend paired with a Rust backend.",
    funFact:
      "Before settling on Rust, Tauri's creators Daniel Thompson-Yvetot and Lucas Nogueira experimented with building the framework in C++, Go, and Objective-C.",
    icon: "/logos/tauri.svg",
    aspect: 0.886,
    gitLink: "https://github.com/tauri-apps/tauri",
  },
  {
    name: "TypeORM",
    industry: "TypeScript ORM",
    founded: 2016,
    description:
      "TypeORM is an ORM for TypeScript and JavaScript that supports Active Record and Data Mapper patterns across many SQL and NoSQL databases.",
    funFact:
      "TypeORM was created by Umed Khudoiberdiev and stayed in pre-1.0 releases for nearly a decade until finally reaching 1.0 in May 2026.",
    icon: "/logos/typeorm.svg",
    aspect: 1.099,
    gitLink: "https://github.com/typeorm/typeorm",
  },
  {
    name: "UnJS",
    industry: "JavaScript tooling ecosystem",
    founded: 2022,
    description:
      "UnJS is a collective of unified, framework-agnostic JavaScript tools and libraries designed to work identically across Node.js, Deno, Bun, browsers, and edge runtimes.",
    funFact:
      "UnJS grew out of Pooya Parsa's work as Nuxt's framework architect, as pieces of Nuxt 3's internals were extracted into standalone packages to give the wider JS ecosystem unified, runtime-agnostic foundations.",
    icon: "/logos/unjs.svg",
    aspect: 1,
    gitLink: "https://github.com/unjs",
  },
  {
    name: "V8",
    industry: "JavaScript engine",
    founded: 2008,
    description:
      "V8 is Google's open-source, high-performance JavaScript and WebAssembly engine that compiles code to native machine instructions, used in Chrome and Node.js.",
    funFact:
      "V8 is named after the V8 car engine, a nod to raw power chosen by lead developer Lars Bak, who Google recruited in 2006 specifically to build a fast runtime for the then-secret Chrome project.",
    icon: "/logos/v8.svg",
    aspect: 1.128,
    gitLink: "https://github.com/v8/v8",
  },
  {
    name: "WebAssembly",
    industry: "Binary instruction format",
    founded: 2015,
    description:
      "WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine, designed as a fast, portable compilation target for languages like C, C++, and Rust.",
    funFact:
      "WebAssembly's announcement in June 2015 was coordinated across all four major browser vendors simultaneously, each publishing a blog post linking to the others the same day.",
    icon: "/logos/webassembly.svg",
    aspect: 1,
    gitLink: "https://github.com/WebAssembly/spec",
  },
]
