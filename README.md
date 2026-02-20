# Sprint Pointing App for ServiceNow

## Project Overview
A modern planning poker application built directly into ServiceNow to eliminate third-party tools and streamline sprint refinement sessions.

## MVP Features
- Real-time planning poker voting interface
- Anonymous voting with moderator-controlled reveal
- Automatic story point updates in ServiceNow
- Clean 3-panel UI (backlog, story details, voting cards)
- Session management for refinement meetings

## Tech Stack
- **Backend**: ServiceNow (Scoped App)
- **Frontend**: React-style UI in Service Portal
- **Instance**: PDI (Personal Developer Instance)
- **Version Control**: GitHub

## Project Status
✅ **v1.0.0 MVP Complete** - Functional application with all core features working
🎨 **v2.0 In Planning** - Complete UX/UI redesign and enhancement phase

### What's Working (v1.0)
- ✅ Backend API (7 endpoints, all tested)
- ✅ Session management
- ✅ Voting functionality
- ✅ Results and consensus calculation
- ✅ Automatic story point updates
- ✅ Moderator controls

### Known Issues (v1.0)
- UI needs visual polish
- End-to-end flow is clunky
- Colors and styling need improvement
- Some bugs in edge cases

### Coming in v2.0
- Complete visual redesign
- Modern color scheme
- Smooth animations
- Better user experience
- Mobile responsive
- Advanced features

## Quick Links
- **v1.0 Release Notes**: See `V1_COMPLETE.md`
- **v2.0 Planning**: See `V2_PLANNING.md`
- **Implementation Guides**: See `servicenow/` folder
- **Project Summary**: See `PROJECT_SUMMARY.md`


## Competition Details
- **Objective**: Demonstrate impactful use of Kiro IDE for ServiceNow development
- **Timeline**: Feb 5 - March 2, 2026
- **Judge**: VP John Morton
- **Prize**: $200 Motivosity + street cred

## Development Timeline
- **v1.0 Development**: 5 hours (with Kiro AI)
- **Traditional Estimate**: 48-64 hours
- **Time Saved**: 90%

## Repository Structure
```
├── README.md                    # This file
├── V1_COMPLETE.md              # v1.0 release notes
├── V2_PLANNING.md              # v2.0 enhancement plan
├── QUICK_START.md              # Getting started guide
├── CHECKLIST.md                # Implementation checklist
├── PROJECT_SUMMARY.md          # Complete project overview
├── docs/                       # Design documentation
│   ├── DESIGN.md
│   ├── SETUP_GUIDE.md
│   └── ACTION_PLAN.md
└── servicenow/                 # Implementation guides
    ├── 01_CREATE_SCOPED_APP.md
    ├── 02_CREATE_TABLES.md
    ├── 03_CREATE_SCRIPT_INCLUDE.md
    ├── 04_CREATE_REST_API.md
    ├── 05_TEST_API.md
    ├── 06_CREATE_UI.md
    ├── 07_CREATE_UI_SCRIPTS.md
    └── 08_POLISH_AND_DEMO.md
```

## License
Built for the ServiceNow x AI Competition - February 2026
