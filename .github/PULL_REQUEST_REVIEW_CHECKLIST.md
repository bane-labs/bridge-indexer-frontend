# Pull Request Review Checklist

This document serves as a comprehensive guide for reviewing pull requests in the Atlas project. Use
this checklist to ensure thorough and consistent code reviews.

## Review Objectives

- Maintain high code quality and consistency
- Catch bugs and edge cases early
- Ensure security and performance best practices
- Foster knowledge sharing and team growth
- Maintain comprehensive documentation

---

## Review Process

### 1. **Initial Assessment** (2-3 minutes)

- [ ] Read the PR description and understand the context
- [ ] Check if the PR is linked to an issue or ticket
- [ ] Verify the PR type matches the changes
- [ ] Ensure the PR is not too large (consider suggesting split if >500 lines)
- [ ] Check if all required checkboxes in the template are completed

### 2. **Code Review** (Main Review)

#### Architecture & Design

- [ ] Changes follow established patterns and conventions
- [ ] Code is placed in the appropriate layer/module
- [ ] Separation of concerns is maintained
- [ ] No unnecessary coupling introduced
- [ ] SOLID principles are respected
- [ ] New abstractions are justified and well-designed

#### Code Quality

- [ ] Code is readable and self-documenting
- [ ] Variable and function names are clear and meaningful
- [ ] Functions are small and focused (single responsibility)
- [ ] No code duplication (DRY principle)
- [ ] Complex logic is broken down and well-commented
- [ ] Magic numbers/strings are replaced with named constants
- [ ] Error handling is comprehensive and appropriate
- [ ] No commented-out code or unnecessary console.logs

#### TypeScript/JavaScript Best Practices

- [ ] Types are properly defined (no `any` without justification)
- [ ] Type safety is maintained throughout
- [ ] Null/undefined cases are handled
- [ ] Optional chaining and nullish coalescing used where appropriate
- [ ] Async/await used correctly (no unhandled promises)
- [ ] React hooks dependencies are correct
- [ ] No unnecessary re-renders in React components

#### Performance

- [ ] No obvious performance bottlenecks
- [ ] Efficient algorithms and data structures used
- [ ] Database queries are optimized (if applicable)
- [ ] Proper memoization/caching where beneficial
- [ ] Images and assets are optimized
- [ ] Bundle size impact is reasonable
- [ ] No unnecessary re-renders or computations

#### Security

- [ ] No sensitive data exposed (API keys, passwords, tokens)
- [ ] User input is validated and sanitized
- [ ] SQL injection/XSS vulnerabilities prevented
- [ ] Authentication and authorization checks in place
- [ ] CORS and security headers configured correctly
- [ ] Dependencies don't introduce known vulnerabilities
- [ ] Environment variables used for sensitive config

### 3. **Testing** (Critical)

- [ ] Sufficient test coverage for new code
- [ ] Tests are meaningful and test the right things
- [ ] Edge cases and error scenarios are tested
- [ ] Tests are not brittle or over-mocked
- [ ] Test names clearly describe what they test
- [ ] All tests pass in CI
- [ ] Manual testing instructions are clear (if needed)

### 4. **Documentation**

- [ ] Code is self-documenting or has clear comments
- [ ] Complex algorithms or business logic are explained
- [ ] API changes are documented
- [ ] README updated if needed
- [ ] Environment variables documented (if added/changed)
- [ ] Migration guide provided for breaking changes
- [ ] JSDoc comments for public APIs

### 5. **UI/UX Review** (for frontend changes)

- [ ] UI matches design specifications
- [ ] Responsive design works on different screen sizes
- [ ] Accessibility standards met (WCAG)
- [ ] Keyboard navigation works
- [ ] Loading and error states handled
- [ ] User feedback is clear and helpful
- [ ] No layout shifts or visual bugs

### 6. **Infrastructure & DevOps** (if applicable)

- [ ] Docker configuration is correct
- [ ] Environment variables properly configured
- [ ] CI/CD pipeline updates are correct
- [ ] Database migrations are reversible
- [ ] Deployment notes are clear
- [ ] Monitoring and logging in place

### 7. **Breaking Changes**

- [ ] Breaking changes are clearly documented
- [ ] Migration path is provided
- [ ] Version bump is appropriate
- [ ] Dependent services/apps are considered
- [ ] Backward compatibility maintained where possible

---

## Providing Feedback

### Feedback Categories

Use these prefixes to categorize your feedback:

- **[BLOCKER]**: Must be fixed before merge
- **[CRITICAL]**: Important issue that should be addressed
- **[SUGGESTION]**: Nice-to-have improvement
- **[QUESTION]**: Seeking clarification
- **[NITPICK]**: Minor style/preference (non-blocking)
- **[PRAISE]**: Highlight good work

### Good Review Practices

**DO:**

- Be respectful and constructive
- Explain the "why" behind your feedback
- Provide examples or references
- Acknowledge good solutions
- Ask questions to understand intent
- Suggest alternatives when criticizing
- Review in a timely manner (within 24 hours)

**DON'T:**

- Be dismissive or condescending
- Nitpick without reason
- Block on personal preferences
- Let perfect be the enemy of good
- Review after significant delay

### Example Feedback

**Good:**

```
[SUGGESTION] Consider using useMemo here to prevent recalculation on every render:
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);

This would improve performance when the component re-renders for other reasons.
```

**Avoid:**

```
This is inefficient. Fix it.
```

---

## Approval Criteria

Approve the PR when:

- All blockers are resolved
- Code meets quality standards
- Tests are adequate and passing
- Documentation is complete
- You would be comfortable maintaining this code
- Security and performance are acceptable

Request changes when:

- Critical issues exist
- Tests are missing or inadequate
- Security vulnerabilities present
- Breaking changes not properly handled
- Code quality significantly below standards

---

## Post-Review

After approval:

- [ ] Verify CI passes
- [ ] Ensure merge conflicts are resolved
- [ ] Check that deployment notes are clear
- [ ] Monitor the deployment (if you're available)

---

## Additional Resources

- [Project Documentation](/docs)
- [Environment Variables Guide](/docs/ENVIRONMENT_VARIABLES.md)
- [Platform Principles](/docs/platform-principles.md)

---

## Remember

- Reviews are about the code, not the person
- We're all learning and improving together
- A thorough review now saves debugging time later
- It's okay to ask questions
- Praise good work when you see it

**Goal**: Ship high-quality code that the whole team can maintain and be proud of.
