from flask import session


def is_login():
    return "LOGIN_USER" in session


def is_admin():
    return session["LOGIN_USER"].get("is_admin", False)


def get_user_id():
    return session["LOGIN_USER"].get("id", 0)


def login_success(user):
    session["LOGIN_USER"] = user.to_json()


def logout():
    session.pop("LOGIN_USER", True)
