from flask import session, redirect


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


def require_admin(func):
    def inner(*args, **kwargs):
        if is_admin():
            return func(*args, **kwargs)
        else:
            return redirect("/")

    inner.__name__ = func.__name__
    return inner