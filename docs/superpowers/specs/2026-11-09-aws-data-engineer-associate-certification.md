# Add AWS Certified Data Engineer – Associate

**Slug:** `aws-data-engineer-associate-certification`
**Type:** feature
**Status:** APPROVED
**Provenance:** User request to add the supplied certification to the About page; scope confirmed with the instruction to match existing AWS issuers. Source: `/Users/davide/Downloads/aws-certified-data-engineer-associate.png`.
**Created:** 2026-11-09
**Updated:** 2026-11-09

## Problem and Current Behavior

The About page lists certifications from `data/authors/default.mdx` through
`components/about/CertificationsGrid.tsx`. The supplied AWS Data Engineer
certification is absent. Existing AWS entries use `Amazon Web Services` as
their issuer and support issue dates, expiry dates, images, and credential links.

The supplied PNG contains an embedded Open Badges credential identifying
Davide Aliti as the recipient. The credential supplies the title, issuer,
validity dates, and credential ID; these values do not need to be inferred
from the visible badge artwork.

## Desired Outcome and Scope

Add one complete certification card to the existing About page section,
using the current layout, expiry display, year/issuer grouping, and language
support. This focused content addition is the entire delivery increment.
No wider release or later increment is proposed.

Store this entry in the existing author frontmatter:

| Field        | Value                                                                           |
| ------------ | ------------------------------------------------------------------------------- |
| `title`      | `AWS Certified Data Engineer – Associate`                                       |
| `issuer`     | `Amazon Web Services`                                                           |
| `year`       | `2026`                                                                          |
| `issueDate`  | `2026-11-06`                                                                    |
| `expiryDate` | `2029-11-06`                                                                    |
| `image`      | `/static/images/certifications/aws-certified-data-engineer-associate.png`       |
| `url`        | `https://www.credly.com/badges/4f5219d8-7102-4fba-9b79-a345850c7b87/public_url` |

The embedded issuer is `Amazon Web Services Training and Certification`.
Normalize it to `Amazon Web Services`, as explicitly requested, so the card
joins the existing AWS issuer group. The public Credly URL follows the
embedded credential ID and returned HTTP 200 during discovery.

## Approach and Constraints

Use the existing frontmatter and static-image pipeline. This is the single
appropriate approach because the current schema, renderer, and grouping already
support every required field. A component or schema extension would add work
without improving this outcome.

Publish the supplied 600 × 600 PNG under
`public/static/images/certifications/` and generate its normal compressed
image and responsive variants using the established image pipeline. The
72-pixel badge renderer needs both 144w and 200w PNG/WebP variants; the
pipeline also produces a 600w WebP. Preserve the Downloads source.

Keep generated changes confined to this certification's assets. Preserve
other certifications, existing grouping/sorting rules, and the current UI.
Specification and plan stay uncommitted until both receive separate approval
and the implementation branch is created under the user's Git workflow.

## Acceptance Criteria

- **AC-01:** The author frontmatter contains exactly one new Data Engineer
  certification with all field values shown above.
- **AC-02:** The published main image is a readable 600 × 600 PNG depicting
  the supplied badge. Its 144w and 200w PNG/WebP variants and 600w WebP exist
  at the paths expected by the existing image component.
- **AC-03:** The About page displays the new card in the 2026 group and the
  existing `Amazon Web Services` issuer group when each mode is selected.
- **AC-04:** The card uses existing English/Italian labels, displays expiry
  in November 2029 through the current renderer, and links to the specified
  public Credly credential.
- **AC-05:** Existing certification data, images, grouping behavior, and
  layout remain intact. Relevant existing certification/About tests and the
  production build pass, with any pre-existing failures reported separately.
- **AC-06:** The supplied Downloads image remains unchanged, and the final
  implementation diff contains no unrelated asset processing changes.

## Edge Cases and Safeguards

- Retain the en dash in the credential title and ISO date strings in data.
- Persist extracted metadata in frontmatter before publishing compressed
  images; image compression may remove embedded credential metadata.
- Use the issue year for grouping, matching existing entries. No full-date
  sorting change is needed.
- Verify metadata, image dimensions/variants, and the final change scope;
  use existing behavioral checks and build validation for integration.

## Out of Scope

Changes to certification components, schemas, sorting, localization strings,
other credentials, other pages, or the image-processing utility; publishing,
pushing, and merging.

## Delivery Boundary and Notes

No material scope or design uncertainty remains after extracting the PNG's
embedded metadata and inspecting the existing certification pipeline.
The boundary is coherent because one content entry and its assets produce
the complete requested card. No later capabilities are specified or planned.

**Execution endpoint:** Deliver the new certification card, complete relevant
verification and review, report the result and any limitations, then stop.
Implementation requires separate explicit approval of this specification
and a subsequently presented implementation plan.
