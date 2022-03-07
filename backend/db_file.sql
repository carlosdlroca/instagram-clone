CREATE TABLE User (
    user_id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    username VARCHAR(15) NOT NULL UNIQUE,
    first_name VARCHAR(15),
    last_name VARCHAR(15),
    password VARCHAR(256) NOT NULL,
    profile_image_url VARCHAR(256),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)ENGINE=INNODB;

CREATE TABLE Post (
    post_id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    post_owner VARCHAR(15) NOT NULL,
    post_image_url varchar(256) NOT NULL,
    post_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (post_owner) REFERENCES User(user_id) ON DELETE CASCADE

)ENGINE=INNODB;

CREATE TABLE Likes (
    post_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY(post_id, user_id),

    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
)ENGINE=INNODB;

CREATE TABLE Comments (
    post_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    comment_body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
)ENGINE=INNODB;

CREATE TABLE Followers (
    follower_id VARCHAR(64) NOT NULL,
    followee_id VARCHAR(64) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

    PRIMARY KEY (follower_id, followee_id),
    
    FOREIGN KEY (follower_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES User(user_id) ON DELETE CASCADE
)ENGINE=INNODB;