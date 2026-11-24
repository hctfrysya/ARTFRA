
-- ==========================================
-- ARTFRA DATABASE SCHEMA
-- ==========================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('member', 'curator', 'admin')),
    curator_status VARCHAR(20)
        CHECK (curator_status IN ('pending', 'approved', 'rejected')),
    avatar_url TEXT,
    bio TEXT,
    website_url TEXT,
    instagram_url TEXT,
    behance_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CURATOR APPLICATIONS
CREATE TABLE IF NOT EXISTS curator_applications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    portfolio_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ARTWORKS
CREATE TABLE IF NOT EXISTS artworks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL
        REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] NOT NULL CHECK (CARDINALITY(tags) >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ARTWORK LIKES
CREATE TABLE IF NOT EXISTS artwork_likes (
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    artwork_id BIGINT NOT NULL
        REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
);

-- 6. ARTWORK FAVORITES
CREATE TABLE IF NOT EXISTS artwork_favorites (
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    artwork_id BIGINT NOT NULL
        REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
);

-- 7. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    artwork_id BIGINT NOT NULL
        REFERENCES artworks(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ARTWORK REPORTS
CREATE TABLE IF NOT EXISTS artwork_reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    artwork_id BIGINT NOT NULL
        REFERENCES artworks(id) ON DELETE CASCADE,
    reporter_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'dismissed', 'taken_down')),
    handled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    handled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (artwork_id, reporter_id)
);

-- 9. CHALLENGES
CREATE TABLE IF NOT EXISTS challenges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    curator_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    rules TEXT NOT NULL,
    prize TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date > start_date)
);

-- 10. CHALLENGE SUBMISSIONS
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    challenge_id BIGINT NOT NULL
        REFERENCES challenges(id) ON DELETE CASCADE,
    member_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    artwork_id BIGINT NOT NULL
        REFERENCES artworks(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ,
    UNIQUE (challenge_id, member_id),
    UNIQUE (challenge_id, artwork_id)
);

-- 11. CHALLENGE WINNERS
CREATE TABLE IF NOT EXISTS challenge_winners (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    challenge_id BIGINT NOT NULL
        REFERENCES challenges(id) ON DELETE CASCADE,
    submission_id BIGINT NOT NULL
        REFERENCES challenge_submissions(id) ON DELETE CASCADE,
    rank SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 3),
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (challenge_id, submission_id),
    UNIQUE (challenge_id, rank)
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_artworks_user
    ON artworks(user_id);

CREATE INDEX IF NOT EXISTS idx_artworks_category
    ON artworks(category_id);

CREATE INDEX IF NOT EXISTS idx_artworks_created
    ON artworks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_artwork
    ON comments(artwork_id);

CREATE INDEX IF NOT EXISTS idx_reports_status
    ON artwork_reports(status);

CREATE INDEX IF NOT EXISTS idx_challenges_dates
    ON challenges(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_submissions_challenge
    ON challenge_submissions(challenge_id);

-- ==========================================
-- INITIAL CATEGORIES
-- ==========================================

INSERT INTO categories (name, slug, description)
VALUES
    ('Digital Art', 'digital-art', 'Digital illustrations and artwork'),
    ('Photography', 'photography', 'Photographic creations'),
    ('Painting', 'painting', 'Traditional and contemporary paintings'),
    ('Illustration', 'illustration', 'Creative visual illustrations'),
    ('Graphic Design', 'graphic-design', 'Visual communication and graphic design'),
    ('3D Art', '3d-art', 'Three-dimensional digital artwork')
ON CONFLICT (slug) DO NOTHING;
